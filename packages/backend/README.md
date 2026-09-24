# Backend

Checkout API built with Python and FastAPI.

## Folder structure

```console
.
|-- alembic/              # migration environment and versions
|-- src/
|   `-- checkout/
|       |-- config/       # settings loaded from environment variables
|       `-- health/       # health check endpoint
|-- tests/                # mirrors src/checkout, runs against the installed package
|-- .env.example
|-- alembic.ini
|-- Dockerfile
|-- pyproject.toml
`-- uv.lock
```

Each feature lives under `src/checkout/<feature>/` with its own router, and tests mirror that
structure under `tests/<feature>/`.

## Technologies

- FastAPI
- Pydantic / Pydantic Settings
- SQLAlchemy 2
- Alembic
- uv
- Ruff
- mypy
- pytest

## Commands

Run:

```console
uv run uvicorn checkout.main:app --reload
```

Build:

```console
uv build
docker build .
```

Lint:

```console
uv run ruff check
uv run ruff format --check
uv run mypy
```

Test:

```console
uv run pytest
```

Migrations:

```console
uv run alembic upgrade head
uv run alembic revision -m "<meaningful_name>"
```
