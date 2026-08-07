COMPOSE = docker compose -f docker/compose.local.yml

.PHONY: up down logs migrate test lint backend-test frontend-install frontend-dev

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f api worker

migrate:
	cd shaadigen-backend && alembic upgrade head

backend-test:
	cd shaadigen-backend && pip install -e ".[dev]" && pytest -q

lint:
	cd shaadigen-backend && ruff check src tests

frontend-install:
	cd shaadigen-ai-classic && npm install

frontend-dev:
	cd shaadigen-ai-classic && npm run dev
