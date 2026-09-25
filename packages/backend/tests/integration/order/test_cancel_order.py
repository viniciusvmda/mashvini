from collections.abc import Callable

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.order.model import Order


def _make_item(name: str = "Water", price: float = 2.5, stock: int = 10) -> Item:
    return Item(name=name, price=price, stock=stock, image_url="https://example.com/img.png")


def test_cancel_pending_order_restores_stock_and_marks_cancelled(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = client.post("/orders", json={"lines": [{"item_id": item.id, "quantity": 3}]}).json()[
        "id"
    ]

    response = client.post(f"/orders/{order_id}/cancel")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "cancelled"

    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "cancelled"

    refreshed_item = db_session.get(Item, item.id)
    assert refreshed_item is not None
    assert refreshed_item.stock == 10


def test_cancel_twice_only_restores_stock_once(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = client.post("/orders", json={"lines": [{"item_id": item.id, "quantity": 3}]}).json()[
        "id"
    ]

    first = client.post(f"/orders/{order_id}/cancel")
    second = client.post(f"/orders/{order_id}/cancel")

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["status"] == "cancelled"

    refreshed_item = db_session.get(Item, item.id)
    assert refreshed_item is not None
    assert refreshed_item.stock == 10


def test_cancel_paid_order_returns_409(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = client_with_simulator.post(
        "/orders", json={"lines": [{"item_id": item.id, "quantity": 3}]}
    ).json()["id"]
    client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card"},
        headers={"Idempotency-Key": "pay-1"},
    )

    response = client_with_simulator.post(f"/orders/{order_id}/cancel")

    assert response.status_code == 409

    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "paid"


def test_cancel_missing_order_returns_404(client: TestClient) -> None:
    response = client.post("/orders/999999/cancel")

    assert response.status_code == 404
    assert response.json() == {"detail": "Order 999999 not found"}
