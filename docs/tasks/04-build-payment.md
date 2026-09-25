# Build Payment

We must let clients pay for the order they built. "Finalize order" no longer ends the flow: it persists the order as `pending`, holding its stock, and takes the client to a payment screen. Paying moves the order to `paid` and shows the success screen. 

Cancelling, going back to the cart, or walking away releases the stock. Payment is mocked: the client picks a payment method, is asked to finish the payment on the payment machine, and the payment is approved after 5 seconds. A dev-only simulated machine panel lets us force a decline or a gateway error on demand, per [payment decision](../decisions/07-payment.md).

I will generate a plan from this task description with Claude, make the necessary adjustments and then implement using the root session as coordinator and parallel sub-agents for backend and frontend, since they only share the API contract below.

## Frontend

- Reuse shadcn/ui components from `src/ui`, the `Header`, the cancel confirm dialog, the idle-timeout dialog, and the success screen from the [order task](03-build-order.md) instead of building new versions.
- "Finalize order" now navigates to the payment screen with the created order (id, lines, total) instead of the success screen. The cart state is kept until the payment is approved, so the client can go back and edit it.
- Payment screen (`/payment` route, new):
  - Order summary: lines (name, quantity, line price) and the total returned by the backend, not the one computed client-side.
  - "Select the payment method" message with the method choice: "Card" or "Mobile wallet".
  - Selecting a method starts the payment machine step: show "Finish the payment on the payment machine" for 5 seconds, then send the payment request as approved. The method choice is disabled from here on, so a double tap can't start a second payment.
  - "Back to cart" and "Cancel order" stay available during the machine step (the client may change their mind while standing at the machine), and are disabled only while the payment request is in flight ("Processing payment…").
    - "Back to cart": returns to the catalog with the cart panel open and the cart intact.
    - "Cancel order": reuses the confirm dialog. Confirming clears the cart and navigates to the idle screen.
- Simulated machine panel (dev only):
  - Rendered only when `VITE_PAYMENT_SIMULATOR=true` (env var), next to the "Finish the payment on the payment machine" message and visually marked as a simulator, not part of the kiosk UI.
  - Buttons "Approve", "Decline" and "Gateway error" resolve the machine step immediately with that outcome instead of waiting for the 5 seconds. With no choice, it approves at 5 seconds, same as with the panel off.
  - The chosen outcome is sent as `simulated_outcome` in the payment request.
- Call `POST /orders/{id}/payment` with a TanStack Query mutation, sending an `Idempotency-Key` header (`crypto.randomUUID()`) generated once per payment attempt (when the machine step resolves), not per HTTP request.
  - Approved: clear the cart and navigate to the success screen, which now also shows the order number.
  - Declined (402): toast ("Payment declined, please choose a payment method again") and go back to the method choice. The order is still `pending`, so the client can retry or cancel.
  - Gateway error (502): toast ("We couldn't reach the payment provider, please try again") and go back to the method choice. Nothing was charged, so the retry is a new attempt with a new key.
  - Order expired (409): toast ("Your order expired, please finalize it again"), then return to the catalog with the cart intact.
  - Network error (no response): error toast with a "Try again" action that resends the same request with the same idempotency key, since the client can't know if the first one was charged. Stay on the payment screen.
- "Back to cart", "Cancel order" and the idle timeout all cancel the pending order (releasing its stock) with a `POST /orders/{id}/cancel` mutation. If the cancel request fails, still reset the frontend: the backend expiry releases the stock anyway.
- Idle timeout: also active on the payment screen, same 90 s + 10 s dialog as the catalog. Reaching 0 behaves like a confirmed "Cancel order". Not active during the machine step or while a payment request is in flight.
- Tablet layout: the order summary and the payment method choice side by side in landscape, stacked in portrait. Touch targets for the methods and actions are at least 44px.
- Accessibility: `aria-live` region for the payment status messages, `aria-busy` on the screen while processing, aria labels for the method choice and the simulator buttons.

### Test cases

Behavior is described above, so each case only names the scenario and what to assert.

- "Finalize order" lands on the payment screen with the backend's summary and total, and the cart is intact.
- Machine step: approves after 5 seconds with no choice. A double tap on a method starts a single payment.
- Simulated machine panel: hidden when `VITE_PAYMENT_SIMULATOR` is off. Each button sends its `simulated_outcome` right away.
- One case per payment response above (approved, declined, gateway error, order expired, network error), asserting the screen the client ends on, whether the cart is kept, and whether the next attempt reuses or renews the `Idempotency-Key`.
- Back to cart and Cancel order (confirmed and dismissed), including during the machine step (no payment request is sent) and when the cancel request fails.
- Idle timeout: cancels the pending order and goes to idle. Not triggered during the machine step or while a payment is processing.

## Backend

- Entities:
  - Order (changed)
    - status: str `pending | paid | cancelled | expired` # default `pending`
    - expires_at: datetime # created_at + 5 minutes
  - Payment (new)
    - id: int # PK
    - order_id: int # FK -> order, many attempts per order, at most one `approved`
    - amount: float # computed from the order lines, never received from the client
    - method: str `card | wallet`
    - status: str `approved | declined`
    - decline_reason: str | None
    - gateway_reference: str | None # mocked transaction id
    - idempotency_key: str # unique
    - created_at: datetime # default now()
  - No card data (number, CVC, expiry) is received or stored.
  - **No database enums**: `status` and `method` are plain `String` columns in the database and the migration. The allowed values are Python `StrEnum`s used in the API schemas (`OrderStatus`, `PaymentStatus`, `PaymentMethod`), so FastAPI validates them on input and documents them in OpenAPI, per [payment decision](../decisions/07-payment.md).
- Transitions: `pending -> paid` (payment approved), `pending -> cancelled` (client cancel), `pending -> expired` (expiry sweep). `cancelled`/`expired` restore the stock of every line. Every transition locks the order row (`SELECT ... FOR UPDATE`) and runs in a single transaction, so a pay, a cancel and the sweep racing each other can't both win.
- `POST /orders` (changed): creates the order as `pending` with `expires_at`. The response adds `status`, `expires_at` and `total`.
- `POST /orders/{id}/payment` (new):
  - Body: `{method, simulated_outcome?}`, with `simulated_outcome` one of `approved | declined | gateway_error`. Header: `Idempotency-Key` (required, 422 when missing).
  - `simulated_outcome` is only honored when `PAYMENT_SIMULATOR_ENABLED=true` in `Settings` (`config/env.py`). Otherwise it's ignored and the payment is approved, so a kiosk build can't force outcomes.
  - If a payment with that key already exists, return its stored result (including a stored decline) without calling the gateway again.
  - In a single transaction: lock the order, check that it's `pending` and not past `expires_at`, compute the amount from the lines, call the mock gateway, persist the payment attempt, and on approval move the order to `paid`.
  - Mock gateway behind a `PaymentGateway` protocol injected as a dependency (so the mock can be swapped for a real provider). It returns the requested outcome right away: the 5 second machine wait happens on the client, so the order row isn't locked while the client is at the machine.
  - Custom exceptions mapped to the existing exception handlers (`{"detail": str}`):
    - `OrderNotFoundError` -> 404
    - `OrderNotPayableError` (already `paid`/`cancelled`) -> 409
    - `OrderExpiredError` (past `expires_at`, expired in the same transaction) -> 409
    - `PaymentDeclinedError` -> 402, the declined attempt is still persisted
    - `PaymentGatewayError` -> 502, nothing persisted, the order stays `pending`
  - Return the payment: `{id, order_id, amount, method, status}`.
- `POST /orders/{id}/cancel` (new): lock the order. `pending` -> `cancelled` + restore stock. Already `cancelled`/`expired` -> 200 with the current order (idempotent). `paid` -> 409.
- Expiry sweep: an asyncio background task started in the FastAPI lifespan runs every 60 seconds and moves `pending` orders past `expires_at` to `expired`, restoring their stock (`FOR UPDATE SKIP LOCKED`, so it never blocks on an order being paid).
- Add logging for payment attempts and results (approved, declined with reason, gateway error, idempotent replay, simulated outcome used), cancels and expired orders per sweep.
- Alembic migration: `status` and `expires_at` on `orders` (existing rows backfilled as `paid`, since they completed under the old flow) and the `payments` table.
- Add `PAYMENT_SIMULATOR_ENABLED` (backend) and `VITE_PAYMENT_SIMULATOR` (frontend) to the `.env.example` files and `compose.yaml`, enabled by default for local development.

### Unit tests

Pure logic, no database. Lives in `tests/unit/`. Behavior is described above, so each case only names the scenario.

- Request validation (422): missing `Idempotency-Key`, invalid or missing `method`, invalid `simulated_outcome`.
- Mock gateway: each simulated outcome, no outcome given, and `PAYMENT_SIMULATOR_ENABLED` off.

### Integration tests

Against real Postgres, same setup as the [order task](03-build-order.md). Each case verifies the order status, the payment rows and the stock through direct DB queries, not only the response.

- `POST /orders` creates a `pending` order.
- One case per payment outcome and exception above (approved, declined then approved with a new key, gateway error, not payable, expired).
- Idempotent replay of the same key, for an approved and a declined attempt: a single payment row, identical responses.
- Cancel: `pending`, twice (stock restored only once) and `paid`.
- Races: two payments with different keys, and a payment against a cancel, on the same order. Exactly one wins and stock matches the winner.
- Sweep: only `pending` orders past `expires_at` expire.

## Changes from the original design

- Minor adjustments like addind delay after selecting the payment method to visualize the transitions and add a countdown for the auto-approve.