import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  EyeOff,
  History,
  Keyboard,
  Maximize,
  MessageSquare,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Square,
  Users,
  WifiOff,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { getSocket } from '../../lib/socket.js';
import { useApi } from '../../hooks/useApi.js';
import { useServerClock } from '../../hooks/useServerClock.js';
import { useSocketEvent } from '../../hooks/useSocketEvent.js';
import { Avatar, Badge, Button, Card, CardHeader, Drawer, EmptyState, PageHeader, ProgressBar, StatCard, StatusBadge, Tabs, useConfirm } from '../../components/ui/index.js';
import { PageLoader } from '../../components/layout/PageLoader.jsx';
import { fmtDuration, fmtTime } from '../../lib/format.js';

const EVENT_META = {
  TAB_HIDDEN: { icon: EyeOff, label: 'Left the tab' },
  WINDOW_BLUR: { icon: MousePointerClick, label: 'Window lost focus' },
  FULLSCREEN_EXIT: { icon: Maximize, label: 'Exited fullscreen' },
  DUPLICATE_TAB: { icon: Copy, label: 'Opened a second tab' },
  COPY: { icon: Copy, label: 'Tried to copy' },
  CUT: { icon: Copy, label: 'Tried to cut' },
  PASTE: { icon: Copy, label: 'Tried to paste' },
  CONTEXT_MENU: { icon: MousePointerClick, label: 'Right-clicked' },
  SHORTCUT: { icon: Keyboard, label: 'Blocked shortcut' },
  DEVTOOLS: { icon: AlertTriangle, label: 'Possible DevTools' },
  OFFLINE: { icon: WifiOff, label: 'Was offline' },
  NAVIGATION: { icon: AlertTriangle, label: 'Tried to leave' },
};
const SEVERITY_TONE = { CRITICAL: 'danger', WARNING: 'warn', INFO: 'neutral' };
const REASON = { PROCTORING_LIMIT: 'Auto-submitted', TEACHER: 'Force-submitted', TIMEOUT: 'Time ran out', ASSESSMENT_ENDED: 'Quiz ended', MANUAL: 'Submitted' };
const ONLINE_WINDOW_MS = 40_000;

function statusOf(row, now) {
  const at = row.attempt;
  if (!at) return 'not-started';
  if (at.state !== 'IN_PROGRESS') return at.submitReason === 'PROCTORING_LIMIT' || at.submitReason === 'TEACHER' ? 'forced' : 'submitted';
  const online = at.online ?? (at.lastSeenAt && now - new Date(at.lastSeenAt).getTime() < ONLINE_WINDOW_MS);
  return online ? 'writing' : 'offline';
}

const STATUS_BADGE = {
  'not-started': <Badge>Not started</Badge>,
  writing: (
    <Badge tone="success" dot pulse>
      Writing
    </Badge>
  ),
  offline: (
    <Badge tone="warn" dot>
      Disconnected
    </Badge>
  ),
  submitted: <Badge tone="primary">Submitted</Badge>,
  forced: <Badge tone="danger">Auto/force-submitted</Badge>,
};

function EventLine({ e, name }) {
  const meta = EVENT_META[e.type] || { icon: Activity, label: e.type };
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${e.severity === 'CRITICAL' ? 'bg-danger-soft text-danger' : e.severity === 'WARNING' ? 'bg-warn-soft text-warn' : 'bg-surface-2 text-muted'}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate">
          {name && <span className="font-semibold">{name} · </span>}
          {meta.label}
          {e.details && <span className="text-muted"> ({e.details})</span>}
        </p>
        <p className="text-xs text-subtle">
          {fmtTime(e.occurredAt || e.at)} · {e.severity === 'INFO' ? 'logged' : 'counted as warning'}
        </p>
      </div>
    </li>
  );
}

export default function LiveMonitor() {
  const { id } = useParams();
  const confirm = useConfirm();
  const { data, loading, error, reload, setData } = useApi(`/assessments/${id}/monitor`);
  const clock = useServerClock(1000);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState('counted');
  const [timelineFor, setTimelineFor] = useState(null);
  const [busy, setBusy] = useState(null);
  const reloadTimer = useRef();

  useEffect(() => {
    if (data?.serverNow) clock.sync(data.serverNow);
  }, [data?.serverNow]);

  // Join the monitor room (and re-join after reconnects).
  useEffect(() => {
    const socket = getSocket();
    const join = () =>
      socket.emit('monitor:join', { assessmentId: id }, (ack) => {
        if (!ack?.ok) toast.error('Live updates are unavailable for this quiz');
      });
    join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
      socket.emit('monitor:leave', { assessmentId: id });
    };
  }, [id]);

  const softReload = useCallback(() => {
    clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(reload, 400);
  }, [reload]);
  useEffect(() => () => clearTimeout(reloadTimer.current), []);

  const patchAttempt = useCallback(
    (attemptId, patch) =>
      setData((d) =>
        d && {
          ...d,
          roster: d.roster.map((r) => (r.attempt?.id === attemptId ? { ...r, attempt: { ...r.attempt, ...(typeof patch === 'function' ? patch(r.attempt) : patch) } } : r)),
        },
      ),
    [setData],
  );
  const nameOf = useCallback((attemptId) => data?.roster.find((r) => r.attempt?.id === attemptId)?.student.name, [data]);

  useSocketEvent('monitor:attempt-started', softReload);
  useSocketEvent('monitor:submitted', (p) => {
    patchAttempt(p.attemptId, { state: 'SUBMITTED', submitReason: p.submitReason, score: p.score, submittedAt: p.submittedAt });
    if (p.submitReason === 'PROCTORING_LIMIT') toast(`${nameOf(p.attemptId) || 'A student'} was auto-submitted (warning limit)`, { icon: '🛑' });
  });
  useSocketEvent('monitor:progress', (p) => patchAttempt(p.attemptId, { answered: p.answered, total: p.total, lastSeenAt: p.at, online: true }));
  useSocketEvent('monitor:presence', (p) => patchAttempt(p.attemptId, { online: p.online, lastSeenAt: p.online ? p.at : undefined }));
  useSocketEvent('monitor:extended', (p) => patchAttempt(p.attemptId, { deadlineAt: p.deadlineAt }));
  useSocketEvent('monitor:state', (p) => setData((d) => d && { ...d, assessment: { ...d.assessment, state: p.state } }));
  useSocketEvent('proctor:event', (p) => {
    const event = { type: p.type, severity: p.severity, occurredAt: p.at, attemptId: p.attemptId, studentId: p.studentId };
    patchAttempt(p.attemptId, (at) => ({ violationCount: p.violationCount, events: [...(at.events || []), event], lastSeenAt: p.at, online: true }));
    setData((d) => d && { ...d, events: [event, ...d.events].slice(0, 300) });
    if (p.counted) toast(`${nameOf(p.attemptId) || 'A student'}: ${EVENT_META[p.type]?.label || p.type} (${p.violationCount}/${p.max || '∞'})`, { icon: '⚠️', id: `ev-${p.attemptId}` });
  });

  const now = clock.now;
  const rows = useMemo(() => (data?.roster || []).map((r) => ({ ...r, status: statusOf(r, now) })), [data, now]);
  const counts = useMemo(() => rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1, flagged: (acc.flagged || 0) + (r.attempt?.violationCount > 0 ? 1 : 0) }), {}), [rows]);

  if (loading && !data) return <PageLoader label="Loading live monitor…" />;
  if (error) return <Card><EmptyState icon={AlertTriangle} title="Monitor unavailable" description={error} action={<Button to="/assessments">Back</Button>} /></Card>;

  const a = data.assessment;
  const policy = a.proctoring;
  const live = ['AVAILABLE', 'LIVE', 'PAUSED'].includes(a.state);
  const submittedRows = rows.filter((r) => r.attempt && r.attempt.state !== 'IN_PROGRESS');
  const avg = submittedRows.length ? Math.round((submittedRows.reduce((n, r) => n + (r.attempt.score || 0), 0) / submittedRows.length) * 10) / 10 : null;

  const filtered = rows.filter((r) => {
    const t = tab === 'all' || (tab === 'flagged' ? r.attempt?.violationCount > 0 : tab === 'done' ? ['submitted', 'forced'].includes(r.status) : tab === 'writing' ? ['writing', 'offline'].includes(r.status) : r.status === tab);
    return t && `${r.student.name} ${r.student.usn || ''}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  const control = async (action) => {
    if (action === 'end' && !(await confirm({ title: 'End the quiz for everyone?', body: 'All attempts in progress will be submitted now.', confirmLabel: 'End quiz', tone: 'danger' }))) return;
    setBusy(action);
    try {
      await api.post(`/assessments/${id}/${action}`);
      toast.success(`Quiz ${action === 'end' ? 'ended' : action === 'pause' ? 'paused' : 'resumed'}`);
      reload();
    } catch (e) {
      toast.error(String(e));
    } finally {
      setBusy(null);
    }
  };

  const act = async (row, kind) => {
    const at = row.attempt;
    try {
      if (kind === 'message') {
        const message = await confirm({ title: `Message ${row.student.name}`, body: 'Shown immediately on their screen.', confirmLabel: 'Send', input: { placeholder: 'e.g. Please keep your eyes on your own screen.', minLength: 2 } });
        if (!message) return;
        await api.post(`/attempts/${at.id}/message`, { message });
        toast.success('Message sent');
      }
      if (kind === 'extend') {
        const minutes = await confirm({ title: `Extra time for ${row.student.name}`, body: 'Minutes to add (1–240).', confirmLabel: 'Add time', input: { placeholder: '5', defaultValue: '5', minLength: 1 } });
        if (!minutes) return;
        await api.post(`/attempts/${at.id}/extend`, { minutes: Number(minutes) });
        toast.success(`Added ${minutes} minutes`);
      }
      if (kind === 'submit') {
        const reason = await confirm({ title: `Submit ${row.student.name}'s attempt?`, body: 'Their saved answers are submitted now. Optionally tell them why.', confirmLabel: 'Force submit', tone: 'danger', input: { placeholder: 'Reason (optional)' } });
        if (reason === false) return;
        await api.post(`/attempts/${at.id}/force-submit`, { reason: reason || undefined });
        toast.success('Attempt submitted');
      }
    } catch (e) {
      toast.error(String(e));
    }
  };

  const timelineRow = timelineFor && rows.find((r) => r.attempt?.id === timelineFor);
  const feed = data.events.filter((e) => feedFilter === 'all' || e.severity !== 'INFO');

  return (
    <>
      <PageHeader
        eyebrow={`${a.subject.code} · ${live ? 'Live monitor' : 'Quiz report'}`}
        title={a.title}
        description={`${a.questionCount} questions · ${a.durationMinutes} min · ${policy.enabled ? `proctored, auto-submit at ${policy.maxViolations || '∞'} warnings` : 'not proctored'}`}
        actions={
          <>
            <StatusBadge state={a.state} />
            <Button variant="ghost" icon={ArrowLeft} to="/assessments">
              Back
            </Button>
            {a.state === 'LIVE' && (
              <Button icon={Pause} loading={busy === 'pause'} onClick={() => control('pause')}>
                Pause
              </Button>
            )}
            {a.state === 'PAUSED' && (
              <Button variant="primary" icon={Play} loading={busy === 'resume'} onClick={() => control('resume')}>
                Resume
              </Button>
            )}
            {live && (
              <Button variant="danger" icon={Square} loading={busy === 'end'} onClick={() => control('end')}>
                End quiz
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Writing now" value={(counts.writing || 0) + (counts.offline || 0)} hint={counts.offline ? `${counts.offline} disconnected` : 'All connected'} icon={Activity} tone="success" />
        <StatCard label="Submitted" value={(counts.submitted || 0) + (counts.forced || 0)} hint={counts.forced ? `${counts.forced} auto/force-submitted` : avg != null ? `Average ${avg}/${a.maxMarks ?? 10}` : undefined} icon={CheckCircle2} />
        <StatCard label="Not started" value={counts['not-started'] || 0} hint={`${rows.length} enrolled`} icon={Users} tone="info" />
        <StatCard label="Flagged students" value={counts.flagged || 0} hint="At least one warning" icon={ShieldAlert} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card>
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: 'All', count: rows.length },
                { value: 'writing', label: 'Writing', count: (counts.writing || 0) + (counts.offline || 0) },
                { value: 'flagged', label: 'Flagged', count: counts.flagged || 0 },
                { value: 'done', label: 'Submitted', count: (counts.submitted || 0) + (counts.forced || 0) },
                { value: 'not-started', label: 'Not started', count: counts['not-started'] || 0 },
              ]}
            />
            <div className="relative ml-auto w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input className="input pl-9" placeholder="Search name or USN" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th className="min-w-[140px]">Progress</th>
                  <th>Warnings</th>
                  <th>Time left / score</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const at = r.attempt;
                  const left = at && at.state === 'IN_PROGRESS' ? Math.max(0, Math.floor((new Date(at.deadlineAt).getTime() - now) / 1000)) : null;
                  const warnTone = !at?.violationCount ? 'neutral' : policy.maxViolations && at.violationCount >= policy.maxViolations - 1 ? 'danger' : 'warn';
                  const lastEvent = at?.events?.[at.events.length - 1];
                  return (
                    <tr key={r.student._id} className={at?.violationCount && at.state === 'IN_PROGRESS' ? 'bg-danger-soft/20' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={r.student.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{r.student.name}</p>
                            <p className="font-mono text-xs text-muted">{r.student.usn || r.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {STATUS_BADGE[r.status]}
                        {at?.submitReason && at.state !== 'IN_PROGRESS' && <p className="mt-1 text-xs text-muted">{REASON[at.submitReason]}</p>}
                      </td>
                      <td>
                        {at ? (
                          <div>
                            <ProgressBar value={at.answered || 0} max={at.total || 1} tone={at.state === 'IN_PROGRESS' ? 'primary' : 'success'} />
                            <p className="mt-1 text-xs text-muted">
                              {at.answered || 0}/{at.total} answered
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-subtle">—</span>
                        )}
                      </td>
                      <td>
                        {at ? (
                          <button type="button" onClick={() => setTimelineFor(at.id)} className="text-left" title="View timeline">
                            <Badge tone={warnTone}>
                              <ShieldAlert className="h-3 w-3" /> {at.violationCount || 0}
                              {policy.maxViolations ? `/${policy.maxViolations}` : ''}
                            </Badge>
                            {lastEvent && <p className="mt-1 max-w-[140px] truncate text-xs text-muted">{EVENT_META[lastEvent.type]?.label || lastEvent.type}</p>}
                          </button>
                        ) : (
                          <span className="text-xs text-subtle">—</span>
                        )}
                      </td>
                      <td>
                        {left != null ? (
                          <span className={`inline-flex items-center gap-1 font-mono text-sm tabular-nums ${left < 60 ? 'text-danger' : left < 300 ? 'text-warn' : ''}`}>
                            <Clock className="h-3.5 w-3.5" />
                            {a.state === 'PAUSED' ? 'paused' : fmtDuration(left)}
                          </span>
                        ) : at?.score != null ? (
                          <span className="font-display font-bold">{at.score}/{a.maxMarks ?? 10}</span>
                        ) : (
                          <span className="text-xs text-subtle">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        {at?.state === 'IN_PROGRESS' ? (
                          <div className="flex justify-end">
                            <Button size="sm" variant="ghost" icon={MessageSquare} onClick={() => act(r, 'message')} aria-label="Message" title="Message" />
                            <Button size="sm" variant="ghost" icon={Plus} onClick={() => act(r, 'extend')} aria-label="Add time" title="Add time" />
                            <Button size="sm" variant="ghost" icon={Send} onClick={() => act(r, 'submit')} aria-label="Force submit" title="Force submit" className="!text-danger" />
                          </div>
                        ) : at ? (
                          <Button size="sm" variant="ghost" icon={History} onClick={() => setTimelineFor(at.id)}>
                            Timeline
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && <EmptyState icon={Users} title="No students in this view" className="py-10" />}
          </div>
        </Card>

        <Card className="flex max-h-[75vh] flex-col xl:sticky xl:top-20">
          <CardHeader
            title="Live activity"
            description={policy.enabled ? 'Proctoring events as they happen' : 'Proctoring is off for this quiz'}
            actions={
              <select className="input w-auto py-1 text-xs" value={feedFilter} onChange={(e) => setFeedFilter(e.target.value)} aria-label="Filter events">
                <option value="counted">Warnings</option>
                <option value="all">Everything</option>
              </select>
            }
          />
          {feed.length ? (
            <ul className="flex-1 divide-y divide-border overflow-y-auto scrollbar-thin">
              {feed.map((e, i) => (
                <EventLine key={`${e.attemptId}-${e.occurredAt}-${i}`} e={e} name={nameOf(e.attemptId)} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ShieldAlert} title="No events yet" description="Warnings appear here the moment they happen." className="py-10" />
          )}
        </Card>
      </div>

      <Drawer open={Boolean(timelineRow)} onClose={() => setTimelineFor(null)} title={timelineRow ? `${timelineRow.student.name}'s timeline` : ''} description={timelineRow?.student.usn}>
        {timelineRow && (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-surface-2/60 p-3">
                <p className="font-display text-xl font-bold">{timelineRow.attempt.violationCount || 0}</p>
                <p className="text-xs text-muted">warnings</p>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3">
                <p className="font-display text-xl font-bold">
                  {timelineRow.attempt.answered}/{timelineRow.attempt.total}
                </p>
                <p className="text-xs text-muted">answered</p>
              </div>
              <div className="rounded-lg bg-surface-2/60 p-3">
                <p className="font-display text-xl font-bold">{timelineRow.attempt.score ?? '—'}</p>
                <p className="text-xs text-muted">score</p>
              </div>
            </div>
            <ol className="relative ml-3 border-l border-border">
              <li className="mb-4 ml-5 text-sm">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                Started <span className="text-muted">{fmtTime(timelineRow.attempt.startedAt)}</span>
              </li>
              {(timelineRow.attempt.events || []).map((e, i) => {
                const meta = EVENT_META[e.type] || { label: e.type };
                return (
                  <li key={i} className="mb-4 ml-5 text-sm">
                    <span className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ${e.severity === 'CRITICAL' ? 'bg-danger' : e.severity === 'WARNING' ? 'bg-warn' : 'bg-border'}`} />
                    {meta.label} <Badge tone={SEVERITY_TONE[e.severity]}>{e.severity === 'INFO' ? 'logged' : 'warning'}</Badge>
                    <p className="text-xs text-muted">
                      {fmtTime(e.occurredAt)}
                      {e.details ? ` · ${e.details}` : ''}
                    </p>
                  </li>
                );
              })}
              {timelineRow.attempt.submittedAt && (
                <li className="ml-5 text-sm">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-success" />
                  {REASON[timelineRow.attempt.submitReason] || 'Submitted'} <span className="text-muted">{fmtTime(timelineRow.attempt.submittedAt)}</span>
                </li>
              )}
            </ol>
          </>
        )}
      </Drawer>
    </>
  );
}
