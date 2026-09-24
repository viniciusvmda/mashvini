# Application requirements

## Functional

- User needs to:
  - Browse the catalog (no CRUD)
    - See which items are out of stock
  - Create an order
    - Add items
    - Add more than one of the same item
    - Remove items
    - Cancel order
  - Pay order (mocked)
    - Cancel order before payment
- No authentication: the kiosk is a shared public terminal, there is no logged-in user

## Non-functional

- Portability
  - needs to work on tablets with different screen sizes
  - needs to run on a Unix machine
- Usability: there is no one to assist the user if they have any doubts, so the interface must be simple and clear
- Resilience: since the user is alone, we must handle API/frontend errors gracefully without breaking the screen. We must also cover edge cases like an empty cart, items no longer available in stock, or a double tap on pay submitting the same order twice.
- Accessibility: I will address only visual accessibility in the first version
- ACID transactions for orders: we may have multiple users making orders at the same time. We need to make sure that the transactions are ACID, not allowing situations like two clients buying the same last item of the catalog: one of them must fail in this case.