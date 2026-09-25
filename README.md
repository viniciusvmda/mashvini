# MashVini

Welcome to MashVini! This is the second best self-service checkout web app in the world. It allows clients to browse the catalog, build an order, and pay in a seamless way.

## Running with Docker Compose (reviewers)

The only prerequisites are Docker and `make` (or run the `docker compose` command below directly).

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

> [!NOTE]
> `make down` keeps the database volume, so orders and stock changes survive the next `make up`.
> To reset stock to the seed values, delete the volume with
> `docker compose --profile full down -v`.

### Try it

The payment simulator panel is on by default in Docker Compose, so every edge case can be reproduced from the kiosk screen:

- **Sold-out items:** Guaraná Antártica, Halls, and Aritana Popcorn are seeded with no stock.
- **Stock limit:** add an item until its `+` button stops working (Pringles has 5 in stock).
- **Declined card / gateway error:** on the payment screen, pick a method, then tap "Decline" or "Gateway error" on the simulator panel. After 3 failures, the "contact support" dialog opens.
- **Changed mind:** tap "Back to cart" or "Cancel order" while the payment machine is waiting.
- **Walked away:** leave the catalog or payment screen untouched for 90 seconds.
- **Network failure:** stop the backend (`docker compose stop backend`) and finalize or pay an
  order.
- **Last unit, two kiosks:** open two browser tabs, put the last units of an item in both carts,
  and finalize both. The second one gets a toast and keeps the rest of its cart.

The screenshots of the live application are available in [screenshots](docs/screenshots/).

## Stack

- Frontend: React, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS, Biome. See [`docs/decisions/01-frontend.md`](docs/decisions/01-frontend.md).
- Backend: Python, FastAPI, SQLAlchemy, Alembic, uv, ruff, mypy. See [`docs/decisions/02-backend.md`](docs/decisions/02-backend.md).
- Database: PostgreSQL. See [`docs/decisions/03-data-persistence.md`](docs/decisions/03-data-persistence.md).
- Tooling: Docker Compose for local orchestration, GitHub Actions for CI. See [`docs/decisions/04-folder-structure.md`](docs/decisions/04-folder-structure.md).

## Folder structure

```console
.
|-- .github/               
|   |-- workflows/         # PR checks workflow  
|-- .claude/               # Claude Code rules and post-edit hooks
|-- docs/                  # decisions, requirements, task descriptions
|-- medias/                # images used by the items rendered with Github raw content endpoint
|-- packages/
|   |-- backend/           # FastAPI checkout API, see packages/backend/README.md
|   `-- frontend/          # React checkout app, see packages/frontend/README.md
|-- compose.yaml
`-- Makefile
```

See each package's own README for its detailed folder structure, technologies, and commands.

## How it was built

Every step leaves a trace in the repo:

1. **Requirements and decisions, written by hand**: Functional and non-functional requirements are in [`docs/requirements.md`](docs/requirements.md). Each area has its own decision file in [`docs/decisions/`](docs/decisions/), stating what was chosen, over what, and why.
2. **Roadmap** [`docs/tasks/README.md`](docs/tasks/README.md): splits the work into tasks (environment, catalog, order, payment, final UI adjustments).
3. **Refined task specs, written by hand**: Each task has its own markdown file in [`docs/tasks/`](docs/tasks/), with Excalidraw wireframes, test cases, technical details, and the API contract between frontend and backend (the request and response shapes each side expects).
4. **Plan, then implement**: Each task file went into Claude Code plan mode (Claude Opus 5.5). I adjusted the plan, then implemented it in auto mode (Claude Sonnet 5).
5. **Coordinator and subagents**: The root session coordinated two parallel subagents, one for the backend and one for the frontend. They only shared the API contract from the task file, so neither had to wait on the other.
6. **Guardrails for the agents**:
   - Path-scoped rules in [`.claude/rules/`](.claude/rules/) cover architecture, naming, version pinning, tablet font sizes, and test conventions.
   - Post-edit hooks in [`.claude/hooks/`](.claude/hooks/) run after every edit: `ruff`, `mypy`, and `pytest` on the backend; `biome` and `vitest` on the frontend.
   - CI runs the same checks on every PR.
7. **Review**: I reviewed all of the implementation. Whatever I changed or threw away is logged under "Changes from the original design" in each task file, for example:
   - Kept: Sonner's function-based toasts. Discarded: the custom status-toast components that
     were planned.
   - Fixed: infinite scroll loaded every page at once.
   - Changed: the cart panel was always open. It became a toggleable sidebar, which was the original intent.
   - Added: a "contact support" dialog after repeated payment failures, since nobody is there to help.
8. **Feedback loop into the rules.** When review and validation turned up a recurring issue, I wrote it into rules so later tasks wouldn't repeat it. Examples:
   - Explicit tablet font and button sizes instead of shadcn's compact defaults.
   - Tests for invalid and out-of-range parameters.
   - No native database enums.
   - No deprecated TanStack Query methods.

## What's implemented

These map to [`docs/requirements.md`](docs/requirements.md):

- **Catalog:** fetched from the API, with infinite scroll. Out-of-stock items are marked instead of priced.
- **Order:** the cart lives in a side panel. Customers can add and remove items, change quantities, and cancel with a confirm step.
- **Payment:** "Finalize order" saves the order as `pending` and holds its stock. On the next screen the customer picks a payment method and finishes on a simulated payment machine. A success screen then resets the kiosk.
- **Tablet use:** the UI is mobile-first, with touch-sized buttons and tablet font sizes.
- **Self-service edge cases:**
  - **Empty cart:** no finalize or cancel actions are shown.
  - **Invalid input:** the quantity stepper stops at the available stock, and the API rejects anything else with a 422. Stock and the payment amount are always re-read on the server, never taken from the client.
  - **Item sold out while in the cart:** "Finalize order" gets a 409, a toast names the item, its stock updates in the catalog, and the rest of the cart stays intact.
  - **Last unit bought by two kiosks at once:** stock is re-checked and decremented in a single Postgres transaction with row locks, so one of the two orders fails cleanly.
  - **Concurrent requests:** endpoints run in FastAPI's threadpool, and each request gets its own database session. The API keeps no shared in-memory state, so all shared state lives in Postgres. Integration tests race real threads for the last unit, two payments on one order, and a payment against a cancel.
  - **Double tap on pay:** the screen is disabled while processing, and an `Idempotency-Key` header stops a second charge.
  - **API or network failure:** errors show as toasts without breaking the screen. A gateway error retries with a new `Idempotency-Key`. A lost response retries with the same key, since the kiosk can't know if the first charge went through. After 3 failed payment attempts, a "contact support" dialog appears.
  - **Order expired at the payment screen:** the customer goes back to the cart with it intact and can finalize again.
  - **Changed mind:** the customer can cancel, or go back to the cart from payment. Either way the held stock is released.
  - **Walked away:** an idle warning with a countdown appears after ~100 s. A 5-minute backend expiry job releases stock even if the tablet dies.
  - **Declined card:** the order stays `pending` so the customer can retry without rebuilding the cart.

## Key decisions

The full list is in [`docs/decisions/`](docs/decisions/). The ones that shape the checkout flow:

- **The order holds stock from "Finalize order" until payment**, instead of creating and paying it in one request, so another kiosk can't take the last unit while the customer is at the payment machine ([07](docs/decisions/07-payment.md)).
- **A simulated payment machine instead of a card form**, since a kiosk takes payment through a terminal and card data never touches the app ([07](docs/decisions/07-payment.md)).
- **The 5 second machine wait runs on the client**, so no order row stays locked and "Back to cart" still works while the customer is at the machine ([07](docs/decisions/07-payment.md)).
- **`expired` is kept apart from `cancelled`**, so abandoned sessions can be told apart from customers who changed their mind ([07](docs/decisions/07-payment.md)).
- **Order creation is one Postgres transaction with row locks**, tested against real Postgres instead of SQLite, since the race it prevents depends on `SELECT ... FOR UPDATE` ([06](docs/decisions/06-order.md)).

## What's skipped and why

- **Authentication:** a shared public kiosk has no logged-in user.
- **Catalog search and filters:** the snack bar catalog is small, so scrolling through it is
  enough. It can be added in a future feature.
- **Catalog CRUD / admin, multiple catalogs:** not in the requirements. A single `items` table is
  enough ([05](docs/decisions/05-catalog.md)).
- **Real payments and card entry:** discarded in requirements.
- **Non-visual accessibility testing:** the first version targets visual accessibility
  ([requirements](docs/requirements.md)). Aria labels and live regions are in place, but the app
  hasn't been audited or tested with a screen reader.
- **Image resizing / CDN:** simplicity over bandwidth for a small catalog ([05](docs/decisions/05-catalog.md)).
- **Server-side cart / draft orders:** the cart is frontend-only until "Finalize order", so no
  cleanup endpoints are needed ([06](docs/decisions/06-order.md)).
- **Idempotency key on `POST /orders`:** the disabled button covers double taps, and orphan
  `pending` orders expire on their own ([07](docs/decisions/07-payment.md)).
- **Job queue / cron for expiry:** it's one small query per minute, so an in-process asyncio
  task is enough ([07](docs/decisions/07-payment.md)).
- **Cart surviving a page reload:** the cart is in-memory React state. A reload on a kiosk resets it, which is the same outcome as walking away ([03](docs/tasks/03-build-order.md)).
- **End-to-end browser tests:** the flows are covered by component tests and backend integration tests against real Postgres, but nothing drives a real browser against the running stack (e.g. Playwright).


## Development

Copy the environment files before the first run. The backend won't start without its `.env`:

```console
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
cd packages/frontend && npm install
```

`make dev-db`, `make dev-backend`, and `make dev-frontend` each run in the foreground, so start
them in three separate terminals (in that order, since the backend needs the database and the
frontend needs the backend):

- `make dev-db`: starts the database and runs migrations via Docker Compose.
- `make dev-backend`: runs the backend API with `uv run uvicorn --reload`.
- `make dev-frontend`: runs the frontend dev server with `npm run dev`.
- `make test`: runs the backend unit tests and the frontend tests. No database needed.
- `make test-integration`: runs the backend integration tests against the real Postgres, so it
  needs `make dev-db` running first.
- `make lint`: runs the backend and frontend lint/format/type checks.
- `make up`: starts the full stack (database, migrations, backend, frontend) with Docker Compose.
- `make down`: stops the full stack and keeps the database volume.
