# MashVini

Welcome to MashVini! This is the second best self-service checkout web app in the world. It allows clients to browse the catalog, build an order, and pay in a seamless way.

## Running with Docker Compose (reviewers)

The only prerequisite is Docker.

```console
make up
```

This is equivalent to `docker compose --profile full up --build` and starts the database,
runs migrations, and starts both the backend and the frontend.

Once it's up:

- Frontend: http://localhost:5173/
- Backend: http://localhost:8000/health

Tear it down with:

```console
make down
```

## Development

`make dev-db`, `make dev-backend`, and `make dev-frontend` each run in the foreground, so start
them in three separate terminals (in that order, since the backend needs the database and the
frontend needs the backend):

- `make dev-db`: starts the database and runs migrations via Docker Compose.
- `make dev-backend`: runs the backend API with `uv run uvicorn --reload`.
- `make dev-frontend`: runs the frontend dev server with `npm run dev`.
- `make test`: runs the backend and frontend test suites.
- `make lint`: runs the backend and frontend lint/format/type checks.
- `make up`: starts the full stack (database, migrations, backend, frontend) with Docker Compose.
- `make down`: stops the full stack and removes its volumes.

## Stack

- Frontend: React, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS, Biome. See
  [`docs/decisions/01-frontend.md`](docs/decisions/01-frontend.md).
- Backend: Python, FastAPI, SQLAlchemy, Alembic, uv, ruff, mypy. See
  [`docs/decisions/02-backend.md`](docs/decisions/02-backend.md).
- Database: PostgreSQL. See [`docs/decisions/03-data-persistence.md`](docs/decisions/03-data-persistence.md).
- Tooling: Docker Compose for local orchestration, GitHub Actions for CI. See
  [`docs/decisions/04-folder-structure.md`](docs/decisions/04-folder-structure.md).

## Folder structure

```console
.
|-- docs/                  # decisions, requirements, task descriptions
|-- packages/
|   |-- backend/           # FastAPI checkout API, see packages/backend/README.md
|   `-- frontend/          # React checkout app, see packages/frontend/README.md
|-- compose.yaml
`-- Makefile
```

See each package's own README for its detailed folder structure, technologies, and commands.
