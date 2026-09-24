# Frontend

## Folder structure

Screaming, feature-based architecture: features live under `src/<feature>/` with their
components and colocated tests, instead of being grouped by technical layer.

```console
src/
|-- catalog/
|   |-- catalog-item/
|   |   |-- CatalogCard.tsx      # card with image, name, and price/stock badge
|   |   |-- CatalogCard.test.tsx
|   |   |-- StockBadge.tsx       # generic "not available in stock" badge
|   |   `-- StockBadge.test.tsx
|   |-- catalogItem.ts        # CatalogItem/CatalogPage types, CATALOG_PAGE_SIZE
|   |-- Catalog.tsx           # renders the catalog grid via GET /items
|   |-- Catalog.test.tsx
|   |-- CatalogSkeleton.tsx      # loading-state grid of skeleton cards
|   |-- CatalogSkeleton.test.tsx
|   |-- useCatalogItems.ts    # useInfiniteQuery wrapper keyed by page/size
|   `-- useInView.ts          # IntersectionObserver hook for scroll pagination
|-- config/
|   |-- env.ts            # typed environment variables (VITE_API_URL)
|   |-- queryClient.ts     # QueryClient factory with the default API-fetching queryFn
|   `-- queryClient.test.ts
|-- health/
|   |-- HealthStatus.tsx      # renders Healthy/Unhealthy based on GET /health
|   `-- HealthStatus.test.tsx
|-- test/
|   |-- renderWithClient.tsx   # renders a component with QueryClient/Router/Toaster
|   `-- setup.ts           # jest-dom matchers and IntersectionObserver stub for Vitest
|-- ui/
|   |-- badge.tsx            # vendored shadcn/ui primitives (kebab-case)
|   |-- card.tsx
|   |-- skeleton.tsx
|   |-- sonner.tsx
|   `-- utils.ts
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
- shadcn/ui for accessible, unstyled-by-default component primitives (vendored under `src/ui/`)
- Sonner for status toasts
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
