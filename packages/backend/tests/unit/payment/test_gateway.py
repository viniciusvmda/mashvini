import pytest

from checkout.payment.exceptions import PaymentGatewayError
from checkout.payment.gateway import MockPaymentGateway
from checkout.payment.schemas import PaymentMethod, PaymentStatus, SimulatedOutcome


def test_simulated_approved_approves_when_simulator_enabled() -> None:
    gateway = MockPaymentGateway(simulator_enabled=True)

    result = gateway.charge(10.0, PaymentMethod.CARD, SimulatedOutcome.APPROVED)

    assert result.status == PaymentStatus.APPROVED
    assert result.gateway_reference is not None
    assert result.decline_reason is None


def test_simulated_declined_declines_when_simulator_enabled() -> None:
    gateway = MockPaymentGateway(simulator_enabled=True)

    result = gateway.charge(10.0, PaymentMethod.CARD, SimulatedOutcome.DECLINED)

    assert result.status == PaymentStatus.DECLINED
    assert result.decline_reason is not None
    assert result.gateway_reference is None


def test_simulated_gateway_error_raises_when_simulator_enabled() -> None:
    gateway = MockPaymentGateway(simulator_enabled=True)

    with pytest.raises(PaymentGatewayError):
        gateway.charge(10.0, PaymentMethod.CARD, SimulatedOutcome.GATEWAY_ERROR)


def test_no_outcome_given_approves() -> None:
    gateway = MockPaymentGateway(simulator_enabled=True)

    result = gateway.charge(10.0, PaymentMethod.CARD, None)

    assert result.status == PaymentStatus.APPROVED


def test_simulator_disabled_ignores_outcome_and_approves() -> None:
    gateway = MockPaymentGateway(simulator_enabled=False)

    result = gateway.charge(10.0, PaymentMethod.CARD, SimulatedOutcome.DECLINED)

    assert result.status == PaymentStatus.APPROVED
