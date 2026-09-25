from collections.abc import Callable
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.order.expiry import expire_overdue_orders
from checkout.order.model import Order


def _make_item(name: str = "Water", price: float = 2.5, stock: int = 10) -> Item:
    return Item(name=name, price=price, stock=stock, image_url="https://example.com/img.png")


def test_expire_overdue_orders_restores_stock_and_leaves_others_untouched(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    item_a, item_b = seed_items(_make_item("Water", stock=10), _make_item("Soda", stock=5))

    overdue_order_id = client.post(
        "/orders", json={"lines": [{"item_id": item_a.id, "quantity": 3}]}
    ).json()["id"]
    fresh_order_id = client.post(
        "/orders", json={"lines": [{"item_id": item_b.id, "quantity": 2}]}
    ).json()["id"]

    overdue_order = db_session.get(Order, overdue_order_id)
    assert overdue_order is not None
    overdue_order.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    expired_count = expire_overdue_orders(db_session)

    assert expired_count == 1

    db_session.expire_all()
    overdue_order = db_session.get(Order, overdue_order_id)
    fresh_order = db_session.get(Order, fresh_order_id)
    assert overdue_order is not None
    assert fresh_order is not None
    assert overdue_order.status == "expired"
    assert fresh_order.status == "pending"

    refreshed_a = db_session.get(Item, item_a.id)
    refreshed_b = db_session.get(Item, item_b.id)
    assert refreshed_a is not None
    assert refreshed_b is not None
    assert refreshed_a.stock == 10
    assert refreshed_b.stock == 3
