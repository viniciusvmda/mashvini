import threading
from collections.abc import Callable
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.main import create_app
from checkout.order.model import Order
from checkout.payment.gateway import MockPaymentGateway, get_payment_gateway
from checkout.payment.model import Payment


def _make_item(name: str = "Water", price: float = 2.5, stock: int = 10) -> Item:
    return Item(name=name, price=price, stock=stock, image_url="https://example.com/img.png")


def _client_with_simulator() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_payment_gateway] = lambda: MockPaymentGateway(
        simulator_enabled=True
    )
    return TestClient(app)


def _create_order(client: TestClient, item: Item, quantity: int = 1) -> int:
    response = client.post("/orders", json={"lines": [{"item_id": item.id, "quantity": quantity}]})
    order_id: int = response.json()["id"]
    return order_id


def test_approved_payment_marks_order_paid(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(price=2.5, stock=10))
    order_id = _create_order(client_with_simulator, item, quantity=2)

    response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-approved"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["order_id"] == order_id
    assert body["amount"] == 5.0
    assert body["method"] == "card"
    assert body["status"] == "approved"

    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "paid"

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert len(payments) == 1
    assert payments[0].status == "approved"


def test_declined_then_approved_with_new_key(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)

    declined_response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "declined"},
        headers={"Idempotency-Key": "key-declined"},
    )
    assert declined_response.status_code == 402

    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "pending"

    approved_response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-approved-retry"},
    )
    assert approved_response.status_code == 200

    db_session.expire_all()
    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "paid"

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert len(payments) == 2
    assert sorted(p.status for p in payments) == ["approved", "declined"]


def test_gateway_error_persists_nothing_and_keeps_order_pending(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)

    response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "gateway_error"},
        headers={"Idempotency-Key": "key-gateway-error"},
    )

    assert response.status_code == 502

    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "pending"

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert payments == []


def test_paying_already_paid_order_returns_409(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)
    client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-first"},
    )

    response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-second"},
    )

    assert response.status_code == 409


def test_paying_cancelled_order_returns_409(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)
    client_with_simulator.post(f"/orders/{order_id}/cancel")

    response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card"},
        headers={"Idempotency-Key": "key-1"},
    )

    assert response.status_code == 409


def test_paying_expired_order_returns_409_and_expires_order(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item, quantity=3)

    order = db_session.get(Order, order_id)
    assert order is not None
    order.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db_session.commit()

    response = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card"},
        headers={"Idempotency-Key": "key-1"},
    )

    assert response.status_code == 409

    db_session.expire_all()
    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "expired"

    refreshed_item = db_session.get(Item, item.id)
    assert refreshed_item is not None
    assert refreshed_item.stock == 10

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert payments == []


def test_idempotent_replay_of_approved_payment(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)

    first = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-replay"},
    )
    second = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "approved"},
        headers={"Idempotency-Key": "key-replay"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert len(payments) == 1


def test_idempotent_replay_of_declined_payment(
    client_with_simulator: TestClient,
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    order_id = _create_order(client_with_simulator, item)

    first = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "declined"},
        headers={"Idempotency-Key": "key-replay-declined"},
    )
    second = client_with_simulator.post(
        f"/orders/{order_id}/payment",
        json={"method": "card", "simulated_outcome": "declined"},
        headers={"Idempotency-Key": "key-replay-declined"},
    )

    assert first.status_code == 402
    assert second.status_code == 402
    assert first.json() == second.json()

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert len(payments) == 1


def test_concurrent_payments_with_different_keys_only_one_wins(
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    setup_client = _client_with_simulator()
    order_id = _create_order(setup_client, item)

    barrier = threading.Barrier(2)
    results: list[int] = []
    results_lock = threading.Lock()

    def pay(key: str) -> None:
        thread_client = _client_with_simulator()
        barrier.wait()
        response = thread_client.post(
            f"/orders/{order_id}/payment",
            json={"method": "card", "simulated_outcome": "approved"},
            headers={"Idempotency-Key": key},
        )
        with results_lock:
            results.append(response.status_code)

    threads = [threading.Thread(target=pay, args=(f"race-key-{i}",)) for i in range(2)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert sorted(results) == [200, 409]

    db_session.expire_all()
    order = db_session.get(Order, order_id)
    assert order is not None
    assert order.status == "paid"

    payments = (
        db_session.execute(select(Payment).where(Payment.order_id == order_id)).scalars().all()
    )
    assert len(payments) == 1
    assert payments[0].status == "approved"


def test_payment_racing_cancel_leaves_consistent_state(
    seed_items: Callable[..., list[Item]],
    db_session: Session,
) -> None:
    (item,) = seed_items(_make_item(stock=10))
    setup_client = _client_with_simulator()
    order_id = _create_order(setup_client, item, quantity=4)

    barrier = threading.Barrier(2)
    results: dict[str, int] = {}
    results_lock = threading.Lock()

    def pay() -> None:
        thread_client = _client_with_simulator()
        barrier.wait()
        response = thread_client.post(
            f"/orders/{order_id}/payment",
            json={"method": "card", "simulated_outcome": "approved"},
            headers={"Idempotency-Key": "race-pay-key"},
        )
        with results_lock:
            results["pay"] = response.status_code

    def cancel() -> None:
        thread_client = _client_with_simulator()
        barrier.wait()
        response = thread_client.post(f"/orders/{order_id}/cancel")
        with results_lock:
            results["cancel"] = response.status_code

    threads = [threading.Thread(target=pay), threading.Thread(target=cancel)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    db_session.expire_all()
    order = db_session.get(Order, order_id)
    assert order is not None
    refreshed_item = db_session.get(Item, item.id)
    assert refreshed_item is not None

    if order.status == "paid":
        assert results["pay"] == 200
        assert results["cancel"] == 409
        assert refreshed_item.stock == 6
    else:
        assert order.status == "cancelled"
        assert results["pay"] == 409
        assert results["cancel"] == 200
        assert refreshed_item.stock == 10
