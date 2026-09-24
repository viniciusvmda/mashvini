# 04 - Folder structure

- Monorepo with backend and frontend packages
    ```console
    .
    |-- docs/
    |-- packages/
    |   |-- backend/
    |   |   |-- alembic/
    |   |   |-- src/
    |   |   |   `-- checkout/
    |   |   |-- tests/
    |   |   |-- .python-version
    |   |   |-- alembic.ini
    |   |   |-- Dockerfile
    |   |   |-- pyproject.toml
    |   |   `-- uv.lock
    |   `-- frontend/
    |       |-- src/
    |       |-- .nvmrc
    |       |-- biome.json
    |       |-- Dockerfile
    |       |-- package.json
    |       |-- package-lock.json
    |       |-- tsconfig.json
    |       `-- vitest.config.ts
    |-- .gitignore
    `-- compose.yaml
    ```
- Backend, frontend, and database run on containers orchestrated by docker-compose, which also runs the backend's Alembic migrations and seeds, leaving the application ready to run and portable to any operating system.