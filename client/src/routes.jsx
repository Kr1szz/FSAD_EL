import * as Legacy from './pages/legacy/LegacyPages.jsx';

const T = ['teacher', 'admin'];
const A = ['admin'];

/** Routes rendered inside the app shell (sidebar + topbar). */
export const appRoutes = [
  { path: '/', element: <Legacy.Dashboard /> },
  { path: '/students', element: <Legacy.People role="student" />, roles: A },
  { path: '/teachers', element: <Legacy.People role="teacher" />, roles: A },
  { path: '/structure', element: <Legacy.Structure />, roles: A },
  { path: '/subjects', element: <Legacy.Subjects /> },
  { path: '/assessments', element: <Legacy.Assessments /> },
  { path: '/evaluation', element: <Legacy.Evaluation />, roles: T },
  { path: '/grades', element: <Legacy.Grades />, roles: ['student'] },
  { path: '/questions', element: <Legacy.Questions />, roles: T },
  { path: '/assignments', element: <Legacy.Assignments /> },
  { path: '/announcements', element: <Legacy.Announcements /> },
  { path: '/calendar', element: <Legacy.CalendarPage /> },
  { path: '/notifications', element: <Legacy.Notifications /> },
  { path: '/audit', element: <Legacy.Audit />, roles: A },
  { path: '/settings', element: <Legacy.SettingsPage />, roles: A },
  { path: '/rooms/:id', element: <Legacy.ExamRoom /> },
];

/** Routes rendered without the shell (distraction-free exam screens). */
export const fullscreenRoutes = [{ path: '/attempt/:id', element: <Legacy.ExamAttempt /> }];
