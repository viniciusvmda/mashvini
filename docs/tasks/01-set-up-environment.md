# Set up environment

Set up environment according to [decisions](../decisions/) 01-04. This task will be implemented by Claude with Backend and Frontend in parallel sub-agents and then CI and Environment in a same sub-agent after that. The main session will work as a coordinator. I will run a plan session from this document, make adjustments if necessary and the implement with auto-mode.

## Backend: API + Database

Set up backend using python.

- Package manager: uv with pinned versions for python and dependencies
- Dependencies
    - Dev:
        - ruff
            - Add ignore rule for all docstring documentation for files and tests
            - Add ignore rule for assert in tests
        - mypy
            - strict for checkout package
        - pytest
            - Set up paths for tests and implementation
    - FastAPI
    - pydantic
    - SQLAlchemy (v2)
    - alembic
    - uvicorn
- Environment variables
    - Load from `.env` file with pydantic
    - Set database configuration variables
    - Set allowed CORS origin(s) (frontend dev server URL)
- CORS
    - Enable CORS middleware, restricted to the configured allowed origin(s)
- Dockerfile:
    - Local user instead of root
    - Ignore .env and cache/build files
- Claude setup:
    - Add link to Frontend `README.md`
    - Add PostToolUse hooks for auto lint, format and test
    - Rules for backend folder:
        - screaming architecture
        - pinned versions for dependencies
        - naming convention
            - snake_case for Python files
            - kebab-case for folders
        - Generate alembic versions with meaningful name (e.g., add_catalog instead of random number)
- Health endpoint returning 200 (no DB check for now)
- README.md
    - Set folder structure, main technologies and commands to run, build, lint and test

### Acceptance criteria

- ruff check passing
- mypy check passing
- Tests configured and passing (no tests yet)
- API running and returning 200 for /health
- Frontend origin allowed to call the API without CORS errors
- Dockerfile set with image build working and container returning 200 for /health
- Internal folder structure:
    - alembic/
    - src/
        - checkout/
            - health/
                - router.py
            - config/
                - env.py
    - .env # git ignored
    - .env.example

## Frontend

- Set up project with npx with pinned versions
- Npm for package management
- Dependencies
    - Dev:
        - vite using React Compiler
        - vitest
        - React testing library
        - Tailwind CSS
    - Tanstack Query
    - React router
- Scripts:
    - dev, build, test
    - check and check:write for Biome
- Environment variables
    - Load API base URL from `.env` file (e.g. `VITE_API_URL`)
- Claude setup:
    - Add link to Frontend `README.md`
    - Add PostToolUse hooks for auto lint, format and test
    - Rules for frontend folder:
        - screaming architecture
        - pinned versions for dependencies
        - naming convention
            - PascalCase for components
            - camelCase for pure Typescript
            - kebab-case for folders
            - .test.ts suffix for Typescript tests and .test.tsx for component tests
        - export at the bottom
        - separate exports for type
    - Test rules *.test.* files:
        - Tests colocated with files
        - Test cases in third person without 'should' prefix
        - Use Tanstack query QueryClient for mock API calls in tests instead of vi/jest
- Dockerfile
    - Local user instead of root
    - Separate build stage
- Health page hitting the health endpoint and printing Healthy or Unhealthy depending on the response
    - Add test cases for health and unhealthy
- README.md
    - Set folder structure, main technologies and commands to run, build, lint and test

### Acceptance criteria

- Biome check passing
- Tests configured and passing (covering health and unhealthy)
- Health page rendering 
- Dockerfile set with image build working and container returning 200 for /health
- Internal folder structure:
    - src/
        - health/
            - HealthStatus.tsx
            - HealthStatus.test.tsx
        - config/
            - env.ts
        - App.tsx
        - main.tsx
    - .env # git ignored
    - .env.example

## CI

- pr_checks.yml
    - Run checks in parallel for backend and frontend (no integration test with the DB yet)
        - Install
        - Build
        - Build image (no push)
        - Lint and format checks
        - Test

## Environment

- VS Code workspace config:
    - enable format on save and auto save on focus change
    - Set identation with 4 spaces for both Python, Typescript, YAML and markdown
- VS Code debug launch config for frontend and backend
- Docker compose file with database, backend, frontend and migrations/seed run
    - Use profiles: default profile runs only db (+ migrate/seed); `full` profile adds backend and frontend
    - Bind mount backend `src/` and frontend `src/` into the `full` profile containers so they hot reload; no rebuild needed for code changes
- Local dev: run db via compose, backend via `uv run uvicorn ... --reload`, frontend via `npm run dev`
- Makefile at repo root with targets: `dev-db`, `dev-backend`, `dev-frontend`, `up` (full compose), `test` and `lint`
- README.md 
    - add a section about how to run focused in the full docker compose profile (for reviews specially)
    - Add then a section with the makefiles for development
    - Add a section with the full stack
    - Add a section with the high-level folder structure (details are available in each folder backend/frontend readme)
- Set CLAUDE.md
    - Reference README.md for project overview, how to run/test, folder structure and technologies 
    - Don't add autoexplanatory comments, if a comment is necessary it means that the readability is bad and we need to work on it
    - Set ident spacing as 4 for both Python, Typescript, YAML and markdown

### Acceptance criteria

- All Makefile commands working
- Docker Compose full and dev working properly. Frontend and API accessible.