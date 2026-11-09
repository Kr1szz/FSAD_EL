# RVCE Academic Hub

A MERN modular monolith for academic structure, assessments, examinations, grading and reporting.

## Development status

This repository is being built in incremental milestones. See [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) for implemented scope and remaining work.

## Prerequisites

- Node.js 20 or later and npm
- Docker Compose (recommended) or a local MongoDB instance

## Quick start

1. Copy `.env.example` to `.env` and configure secrets and OAuth settings.
2. Run `docker compose up --build`.
3. Open `http://localhost:5173`; the API health endpoint is `http://localhost:4000/api/health`.

Without Docker, install dependencies in `server` and `client` and run `npm run dev` in each directory. Detailed setup and API documentation are in `docs/`.

Never use development seed accounts or secrets in production. Google OAuth requires configured credentials and an authorized RVCE domain or allowlist.
