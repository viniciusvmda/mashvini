# Frontend

## Folder structure

Screaming, feature-based architecture: features live under `src/<feature>/` with their
components and colocated tests, instead of being grouped by technical layer.

```console
src/
|-- config/
|   |-- env.ts            # typed environment variables (VITE_API_URL)
|   `-- queryClient.ts     # QueryClient factory with the default API-fetching queryFn
|-- health/
|   |-- HealthStatus.tsx      # renders Healthy/Unhealthy based on GET /health
|   `-- HealthStatus.test.tsx
|-- test/
|   `-- setup.ts           # jest-dom matchers for Vitest
|-- App.tsx
|-- main.tsx
|-- index.css
`-- vite-env.d.ts
```

## Main technologies

- React with TypeScript
- Vite, with the React Compiler babel plugin enabled
- TanStack Query for server state and API calls
- React Router for client-side routing
- Tailwind CSS for styling
- Biome for linting and formatting
- Vitest and React Testing Library for tests

## Environment variables

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend base URL
(e.g. `http://localhost:8000`).

## Commands

```console
npm run dev            # start the dev server
npm run build           # type-check and build for production
npm run check            # run Biome checks
npm run check:write       # run Biome checks and apply fixes
npm test               # run the test suite
docker build --target runtime .   # build the production nginx image
```
