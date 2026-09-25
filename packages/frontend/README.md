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
|   |   |-- ...
|   |-- catalogItem.ts        # CatalogItem/CatalogPage types, CATALOG_PAGE_SIZE
|   |-- Catalog.tsx           # renders the catalog grid via GET /items
|   |-- Catalog.test.tsx
|   `-- ...
|-- config/
|   |-- env.ts            # typed environment variables (VITE_API_URL)
|   `-- ...
|-- health/
|   |-- HealthStatus.tsx      # renders Healthy/Unhealthy based on GET /health
|   `-- HealthStatus.test.tsx
|-- order/
|   |-- cart/               # cart state (CartContext/cartReducer/cartSelectors/CartPanel)
|   |-- idle/                # IdleScreen (start screen)
|   |-- idle-timeout/         # useIdleTimeout/IdleTimeoutDialog (90s + 10s countdown)
|   |-- layout/               # Header/Footer for the catalog screen
|   |-- success/              # SuccessScreen shown after a payment is approved
|   |-- createOrder.ts        # POST /orders
|   |-- cancelOrder.ts        # POST /orders/{id}/cancel
|   |-- useFinalizeOrder.ts     # creates the order and navigates to /payment
|   |-- useCancelPendingOrder.ts # cancels the pending order, clears the cart, and returns home
|   |-- CancelOrderDialog.tsx   # confirm dialog reused by the catalog and payment screens
|   `-- OrderScreen.tsx        # /catalog route
|-- payment/
|   |-- payOrder.ts          # POST /orders/{id}/payment, Payment/PaymentMethod/SimulatedOutcome types
|   |-- usePaymentMachine.ts   # 5s simulated payment machine timer
|   |-- PaymentScreen.tsx     # /payment route: method choice, machine step, payment result handling
|   |-- OrderSummary.tsx      # order lines and total
|   |-- PaymentMethodChoice.tsx # Card/Mobile wallet buttons
|   `-- SimulatedMachinePanel.tsx # dev-only Approve/Decline/Gateway error panel
|-- test/
|   |-- renderWithClient.tsx   # renders a component with QueryClient/Router/Toaster
|   `-- setup.ts           # jest-dom matchers and IntersectionObserver stub for Vitest
|-- ui/
|   |-- badge.tsx            # vendored shadcn/ui primitives (kebab-case)
|   `-- ...
|-- App.tsx
|-- main.tsx
|-- index.css
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
(e.g. `http://localhost:8000`). `VITE_PAYMENT_SIMULATOR` toggles the dev-only simulated
payment machine panel (Approve/Decline/Gateway error) on the payment screen.

## Commands

```console
npm run dev            # start the dev server
npm run build           # type-check and build for production
npm run check            # run Biome checks
npm run check:write       # run Biome checks and apply fixes
npm test               # run the test suite
docker build --target runtime .   # build the production nginx image
```
