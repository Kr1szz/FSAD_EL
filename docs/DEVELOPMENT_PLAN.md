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
5. Fixed 10-mark quizzes with MCQ and single-line fill-in questions.
6. Rooms, realtime monitoring, proctoring, assignments and analytics.
7. Deployment docs, hardening and automated verification.

Quizzes are worth 10 marks; their questions must add up to 10. Google sign-in is restricted to `rvce.edu.in` by default and requires an institution configured OAuth client ID.
