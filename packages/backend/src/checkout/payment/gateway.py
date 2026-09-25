import uuid
from dataclasses import dataclass
from typing import Annotated, Protocol

from fastapi import Depends

from checkout.config.env import Settings, get_settings
from checkout.payment.exceptions import PaymentGatewayError
from checkout.payment.schemas import PaymentMethod, PaymentStatus, SimulatedOutcome


@dataclass
class GatewayResult:
    status: PaymentStatus
    decline_reason: str | None
    gateway_reference: str | None


class PaymentGateway(Protocol):
    def charge(
        self,
        amount: float,
        method: PaymentMethod,
        simulated_outcome: SimulatedOutcome | None,
    ) -> GatewayResult: ...


class MockPaymentGateway:
    def __init__(self, simulator_enabled: bool) -> None:
        self._simulator_enabled = simulator_enabled

    def charge(
        self,
        amount: float,
        method: PaymentMethod,
        simulated_outcome: SimulatedOutcome | None,
    ) -> GatewayResult:
        outcome = simulated_outcome if self._simulator_enabled else None

        if outcome == SimulatedOutcome.DECLINED:
            return GatewayResult(
                status=PaymentStatus.DECLINED,
                decline_reason="The payment was declined by the simulator",
                gateway_reference=None,
            )
        if outcome == SimulatedOutcome.GATEWAY_ERROR:
            raise PaymentGatewayError

        return GatewayResult(
            status=PaymentStatus.APPROVED,
            decline_reason=None,
            gateway_reference=uuid.uuid4().hex,
        )


def get_payment_gateway(settings: Annotated[Settings, Depends(get_settings)]) -> PaymentGateway:
    return MockPaymentGateway(simulator_enabled=settings.payment_simulator_enabled)
