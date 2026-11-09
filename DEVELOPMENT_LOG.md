# Development log

| Date | Phase | Implemented | Files | Checks | Commit | Remaining |
|---|---|---|---|---|---|---|
| 2026-11-09 | Repository | Git baseline and root workspace | `.gitignore`, `README.md`, `package.json` | Clean initial repository | `c069fd8` | — |
| 2026-11-09 | Planning | Architecture and staged delivery plan | `docs/DEVELOPMENT_PLAN.md` | Documentation review | `3e93645` | — |
| 2026-11-09 | Documentation | Project overview and local setup | `README.md`, `docs/` | Review | `bffbcf6` | — |
| 2026-11-09 | Backend | Express API, Mongoose domain models, Google OAuth verification, RBAC, academic CRUD, exam/attempt APIs, Socket.IO, audit logging | `server/src/` | Syntax and lint checks | `1b5c5ea` | Follow-up modules and integration coverage |
| 2026-11-09 | Assessment foundation | Objective grading, seed data and service tests | `server/src/services/grading.js`, `server/src/scripts/seed.js`, `server/test/` | Seeded 13 disabled example accounts and 3 subjects | `41d0625` | More lifecycle tests |
| 2026-11-09 | Client foundation | React/Vite role-aware dashboard and academic screens | `client/` | Production build passed | `5e56798` | Further accessibility and workflow coverage |
| 2026-11-09 | Development environment | Docker Compose, environment template and deployment documentation | Dockerfiles, `docker-compose.yml`, `.env.example`, `docs/` | Compose configuration validated | `7dde9f4` | Full app image build |
| 2026-11-09 | Docker build fixes | Workspace manifests, Vite build args and lockfile installs | Dockerfiles, Compose | Two image build attempts stopped at npm CLI `Exit handler never called` in build containers | `3f35219`, `9bdd48e` | Resolve container package install in deployment environment |
| 2026-11-09 | Assessment controls | Pause/resume/end controls, attempt listing and individual time extension | Assessment API and client bundle configuration | Lint, tests and client build passed | `4a0b3da` | Concurrent lifecycle tests |
| 2026-11-09 | Academic structure | Departments, years, semesters, sections, allocations, assignment uploads/evaluation and academic seed records | `server/src/`, `client/src/App.jsx` | Seed and API runtime checks | `6ea3830` | Bulk allocation tools |
| 2026-11-09 | Local runtime | Loopback Mongo binding and root env loading for Vite | Compose and Vite config | MongoDB started locally | `5b5ef88` | Containerized app build |
| 2026-11-09 | Grading and CIE | Versioned CIE configuration, weighted and best-of consolidation, reports, grade publication and review workflows | CIE/grading services, API, client | Lint, 6 unit cases, build; live API 200 and unauthenticated admin API 401 | `a2c7350` | More policy validation and integration coverage |
| 2026-11-09 | Bulk user import | Quoted CSV parsing, row-level validation, duplicate detection, preview and import UI/template | CSV utility, API, client | Lint, 8 unit cases and build passed | `45b4def` | Bulk subject allocation/export |
| 2026-11-09 | Administration UI | Academic structure screens, subject allocations, assignment creation/submission evaluation and grade clarification | `client/src/App.jsx` | Lint and production build passed | `cb30169` | Full workflow coverage |
| 2026-11-09 | Room-code assessment | Secure room codes, participant checks, Socket.IO start flow and room screens | API, Socket.IO handler, client | Lint, unit tests and build passed | `9ccfd46` | Socket and concurrency integration tests |
| 2026-11-09 | Notifications and settings | Persisted/socket notifications, read history, announcements and CIE scheme screen | Notification service, API, client | Lint, unit tests and build passed | `4671ec6` | Notification integration tests |
| 2026-11-09 | Calendar and timers | Calendar screens and generated assessment/assignment/announcement events; pause-aware deadlines and server expiry finalization | Calendar UI, lifecycle service and API | Lint, unit tests and build passed | `b6a693e` | Calendar/socket integration tests |
| 2026-11-09 | HTTP tests | Health response and unauthenticated admin guard checks | `server/test/http.test.js` | `npm run test -w server`: 10/10 passed with loopback permission | `1b102c3` | Database-backed authorization/lifecycle integration tests |

## Current external dependencies and limits

- Google OAuth requires institution-owned client credentials and the approved RVCE domain/allowlist.
- Academic rules remain configurable; institutional CIE policy values must be supplied before production use.
- The configured GitHub remote could not be pushed because automatic review rejected exporting this repository to the unverified destination. No push was attempted after the rejection.
- The Docker Compose configuration validates and MongoDB runs locally. Building the Node application images fails inside Docker at npm installation with `Exit handler never called`; host lint/tests/build and API runtime checks pass.
