FROM python:3.14.7-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.12.13 /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src ./src
COPY alembic ./alembic
COPY alembic.ini README.md ./
RUN uv sync --frozen --no-dev

FROM python:3.14.7-slim

RUN groupadd --system checkout && useradd --system --gid checkout checkout

WORKDIR /app

COPY --from=builder --chown=checkout:checkout /app /app

ENV PATH="/app/.venv/bin:$PATH"

USER checkout

EXPOSE 8000

CMD ["uvicorn", "checkout.main:app", "--host", "0.0.0.0", "--port", "8000"]
