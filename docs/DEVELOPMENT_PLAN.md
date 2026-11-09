# Development plan

## Architecture

- `client/`: React, Vite, React Router, Axios, Socket.IO client, charts and forms.
- `server/`: Express modular monolith, Mongoose domain models, REST API and Socket.IO handlers.
- MongoDB is the source of truth for identity, academic structure, assessment attempts and grades.

## Delivery sequence

1. Repository and MERN development environment.
2. Authentication, authorization, academic structure and allocations.
3. Subject workspaces and assessment/question lifecycle.
4. Attempts, server-side timing, autosave, evaluation and publication.
5. CIE configuration/consolidation and reporting.
6. Rooms, realtime monitoring, proctoring, assignments and analytics.
7. Deployment docs, hardening and automated verification.

Academic weighting and RVCE identity policies will be configurable. Google OAuth and production email require institution-provided credentials and allowlist settings.
