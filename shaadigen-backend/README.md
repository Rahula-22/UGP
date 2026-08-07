# ShaadiGen Backend

FastAPI backend for the ShaadiGen AI wedding platform. Clean Architecture layout under `src/shaadigen/`.

## Local development

```bash
# From repo root (recommended)
make up

# Or run API directly with a venv
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn shaadigen.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

## M1 milestones

- [ ] JWT auth (register / login / refresh / logout / me)
- [ ] Alembic: `users`, `user_preferences`
- [ ] Redis refresh token store
- [ ] Celery worker + health task

See `docs/architecture/backend.md` in the repo root.
