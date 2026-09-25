from fastapi.testclient import TestClient

from checkout.main import create_app
from checkout.order.model import Order
from checkout.order.repository import get_order_repository
from checkout.order.schemas import OrderLineIn


class FailingOrderRepository:
    def create(self, lines: list[OrderLineIn]) -> Order:
        raise AssertionError("repository should not be called for invalid payloads")


def _client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_order_repository] = lambda: FailingOrderRepository()
    return TestClient(app)


def test_empty_lines_returns_422() -> None:
    client = _client()

    response = client.post("/orders", json={"lines": []})

    assert response.status_code == 422


def test_zero_quantity_returns_422() -> None:
    client = _client()

    response = client.post("/orders", json={"lines": [{"item_id": 1, "quantity": 0}]})

    assert response.status_code == 422


def test_negative_quantity_returns_422() -> None:
    client = _client()

    response = client.post("/orders", json={"lines": [{"item_id": 1, "quantity": -1}]})

    assert response.status_code == 422


def test_missing_item_id_returns_422() -> None:
    client = _client()

    response = client.post("/orders", json={"lines": [{"quantity": 1}]})

    assert response.status_code == 422
