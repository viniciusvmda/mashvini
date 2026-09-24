.PHONY: dev-db dev-backend dev-frontend up test lint

dev-db:
	docker compose up -d db migrate

dev-backend:
	cd packages/backend && uv run uvicorn checkout.main:app --reload

dev-frontend:
	cd packages/frontend && npm run dev

up:
	docker compose --profile full up --build

test:
	cd packages/backend && uv run pytest
	cd packages/frontend && npm test

lint:
	cd packages/backend && uv run ruff check && uv run ruff format --check && uv run mypy
	cd packages/frontend && npm run check
