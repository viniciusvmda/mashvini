import threading
from collections.abc import Callable

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.main import create_app
from checkout.order.model import Order, OrderLine


def _make_item(name: str = "Water", price: float = 2.5, stock: int = 10) -> Item:
    return Item(name=name, price=price, stock=stock, image_url="https://example.com/img.png")


def test_create_order_persists_order_lines_and_decrements_stock(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    item_a, item_b = seed_items(
        _make_item("Water", price=2.5, stock=10), _make_item("Soda", price=3.0, stock=5)
    )

    response = client.post(
        "/orders",
        json={
            "lines": [
                {"item_id": item_a.id, "quantity": 2},
                {"item_id": item_b.id, "quantity": 1},
            ]
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["expires_at"] is not None
    assert body["lines"] == [
        {"item_id": item_a.id, "quantity": 2, "price": 2.5},
        {"item_id": item_b.id, "quantity": 1, "price": 3.0},
    ]

    order = db_session.execute(select(Order).where(Order.id == body["id"])).scalar_one()
    assert order.status == "pending"
    assert order.expires_at is not None
    lines = (
        db_session.execute(
            select(OrderLine).where(OrderLine.order_id == order.id).order_by(OrderLine.item_id)
        )
        .scalars()
        .all()
    )
    assert [(line.item_id, line.quantity, line.price) for line in lines] == [
        (item_a.id, 2, 2.5),
        (item_b.id, 1, 3.0),
    ]

    refreshed_a = db_session.get(Item, item_a.id)
    refreshed_b = db_session.get(Item, item_b.id)
    assert refreshed_a is not None
    assert refreshed_b is not None
    assert refreshed_a.stock == 8
    assert refreshed_b.stock == 4


def test_create_order_with_missing_item_returns_404_and_persists_nothing(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    missing_item_id = item.id + 1000

    response = client.post(
        "/orders",
        json={"lines": [{"item_id": missing_item_id, "quantity": 1}]},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": f"Item {missing_item_id} not found"}

    assert db_session.execute(select(Order)).first() is None
    refreshed = db_session.get(Item, item.id)
    assert refreshed is not None
    assert refreshed.stock == 10


def test_create_order_with_insufficient_stock_returns_409_and_persists_nothing(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=1))

    response = client.post(
        "/orders",
        json={"lines": [{"item_id": item.id, "quantity": 2}]},
    )

    assert response.status_code == 409
    assert item.name in response.json()["detail"]

    assert db_session.execute(select(Order)).first() is None
    refreshed = db_session.get(Item, item.id)
    assert refreshed is not None
    assert refreshed.stock == 1


def test_create_order_rolls_back_entirely_when_one_line_fails(
    client: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    item_ok, item_short = seed_items(_make_item("Water", stock=10), _make_item("Soda", stock=1))

    response = client.post(
        "/orders",
        json={
            "lines": [
                {"item_id": item_ok.id, "quantity": 2},
                {"item_id": item_short.id, "quantity": 5},
            ]
        },
    )

    assert response.status_code == 409
    assert db_session.execute(select(Order)).first() is None
    assert db_session.execute(select(OrderLine)).first() is None

    refreshed_ok = db_session.get(Item, item_ok.id)
    refreshed_short = db_session.get(Item, item_short.id)
    assert refreshed_ok is not None
    assert refreshed_short is not None
    assert refreshed_ok.stock == 10
    assert refreshed_short.stock == 1


def test_concurrent_orders_for_last_unit_only_one_succeeds(
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=1))

    barrier = threading.Barrier(2)
    results: list[int] = []
    results_lock = threading.Lock()

    def place_order() -> None:
        thread_client = TestClient(create_app())
        barrier.wait()
        response = thread_client.post(
            "/orders",
            json={"lines": [{"item_id": item.id, "quantity": 1}]},
        )
        with results_lock:
            results.append(response.status_code)

    threads = [threading.Thread(target=place_order) for _ in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert sorted(results) == [201, 409]

    refreshed = db_session.get(Item, item.id)
    assert refreshed is not None
    assert refreshed.stock == 0

    orders = db_session.execute(select(Order)).scalars().all()
    assert len(orders) == 1
