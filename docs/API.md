# API overview

Base URL: `/api`. JSON responses use `{ "ok": true, "data": ... }`; failures use `{ "ok": false, "error": ... }`. Authenticated requests use an HttpOnly `accessToken` cookie. Lists accept `page` and `limit` where noted.

## Available routes

- `GET /health`
- `POST /auth/google`, `POST /auth/logout`, `GET /auth/me`
- Admin: `GET /admin/dashboard`, `GET|POST /admin/users`, `PATCH /admin/users/:id`, `GET|POST /admin/departments`, `POST /admin/subjects`, `PATCH /admin/subjects/:id/allocations`, `GET /admin/audit-logs`, `GET /admin/reports/grades.csv`
- Subjects: `GET /subjects`, `GET /subjects/:id/students`
- Questions: `GET|POST /questions`
- Assessments: `GET|POST /assessments`, `POST /assessments/:id/publish`, `POST /assessments/:id/start`
- Attempts: `PATCH /attempts/:id/answers`, `POST /attempts/:id/submit`
- Grades: `GET /grades/student`, `GET /grades/assessment/:id`, `POST /grades/:id/publish`, `POST /grades/:id/review`
- CIE: `GET|POST /cie/configurations`, `GET /cie/consolidation/:subjectId`
- Rooms: `POST /rooms`, `POST /rooms/join`
- Assignments: `GET|POST /assignments`, `GET /assignments/:id/submissions`
- Announcements: `GET|POST /announcements`; notifications: `GET /notifications`, `PATCH /notifications/:id/read`; calendar `GET /calendar/events`.

Socket.IO authenticates with the session cookie. Supported controls include `room:join`, `room:start`, `room:pause`, and `room:end`; all room actions are checked against the persisted room and teacher assignment.

All production API endpoints require valid identities provisioned in MongoDB. There is no public account registration or frontend role assignment.
