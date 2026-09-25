class ItemNotAvailableError(Exception):
    def __init__(self, unavailable: list[tuple[str, int]]) -> None:
        self.unavailable = unavailable
        details = ", ".join(f"{name} (available: {available})" for name, available in unavailable)
        super().__init__(f"Not enough stock for: {details}")


class OrderNotFoundError(Exception):
    def __init__(self, order_id: int) -> None:
        self.order_id = order_id
        super().__init__(f"Order {order_id} not found")


class OrderNotPayableError(Exception):
    def __init__(self, order_id: int, status: str) -> None:
        self.order_id = order_id
        self.status = status
        super().__init__(f"Order {order_id} is not payable (status: {status})")


class OrderExpiredError(Exception):
    def __init__(self, order_id: int) -> None:
        self.order_id = order_id
        super().__init__(f"Order {order_id} has expired")
