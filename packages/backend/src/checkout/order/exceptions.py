class ItemNotAvailableError(Exception):
    def __init__(self, unavailable: list[tuple[str, int]]) -> None:
        self.unavailable = unavailable
        details = ", ".join(f"{name} (available: {available})" for name, available in unavailable)
        super().__init__(f"Not enough stock for: {details}")
