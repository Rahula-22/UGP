# ShaadiGen AI

Monorepo for the ShaadiGen AI wedding platform — **classic Next.js frontend** + **FastAPI backend**.

## Repository structure

```text
ShaadiGen-AI/
├── shaadigen-ai-classic/   # Next.js 15 frontend (6 wedding modules)
├── shaadigen-backend/      # FastAPI Clean Architecture backend
├── docker/compose.local.yml
├── Makefile
└── docs/architecture/
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+ (optional — for local venv without Docker)

## Quick start (local)

```bash
# 1. Start backend stack (Postgres, Redis, API, Celery worker)
make up

# 2. Frontend
make frontend-install
cp shaadigen-ai-classic/.env.example shaadigen-ai-classic/.env.local
make frontend-dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API docs | http://localhost:8000/docs |
| Health | http://localhost:8000/api/v1/health |

## Environment files

| File | Purpose |
|------|---------|
| `shaadigen-ai-classic/.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:8000` |
| `shaadigen-backend/.env` | Database, Redis, JWT secrets |

Copy from each `.env.example` — never commit real secrets.

## Milestones

- **M1 (current scaffold):** Platform — JWT auth, users, Redis refresh tokens, Celery
- **M2:** Wedding modules — vendors, shopping, budget, AI try-on jobs
- **M3:** Guest portal RSVP, LLM chatbot, media generation
- **M4:** Azure deployment, Terraform, observability

See [docs/architecture/backend.md](docs/architecture/backend.md) for full backend architecture.

## Frontend modules

| Route | Module |
|-------|--------|
| `/` | Landing dashboard + budget calculator |
| `/vendors` | Vendor matchmaker |
| `/shopping-hub` | Shopping discovery |
| `/ai-studio` | Virtual try-on + pre-wedding shoot |
| `/media-suite` | Love song + invitation cards |
| `/guest-hub` | Guest portal + RSVP + chatbot |
