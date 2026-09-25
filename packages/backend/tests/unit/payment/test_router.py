from fastapi.testclient import TestClient

from checkout.main import create_app
from checkout.payment.model import Payment
from checkout.payment.schemas import PaymentMethod, SimulatedOutcome
from checkout.payment.service import get_payment_service


class FailingPaymentService:
    def pay(
        self,
        order_id: int,
        method: PaymentMethod,
        idempotency_key: str,
        simulated_outcome: SimulatedOutcome | None,
    ) -> Payment:
        raise AssertionError("service should not be called for invalid payloads")


def _client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_payment_service] = lambda: FailingPaymentService()
    return TestClient(app)


def test_missing_idempotency_key_returns_422() -> None:
    client = _client()

    response = client.post("/orders/1/payment", json={"method": "card"})

    assert response.status_code == 422


def test_missing_method_returns_422() -> None:
    client = _client()

    response = client.post("/orders/1/payment", json={}, headers={"Idempotency-Key": "key-1"})

    assert response.status_code == 422


def test_invalid_method_returns_422() -> None:
    client = _client()

    response = client.post(
        "/orders/1/payment",
        json={"method": "cash"},
        headers={"Idempotency-Key": "key-1"},
    )

    assert response.status_code == 422


def test_invalid_simulated_outcome_returns_422() -> None:
    client = _client()

    response = client.post(
        "/orders/1/payment",
        json={"method": "card", "simulated_outcome": "refunded"},
        headers={"Idempotency-Key": "key-1"},
    )

    assert response.status_code == 422
