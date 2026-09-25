import logging
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.database.session import get_session
from checkout.order.exceptions import OrderExpiredError, OrderNotPayableError
from checkout.order.repository import OrderRepository
from checkout.order.schemas import OrderStatus
from checkout.order.stock import release_stock
from checkout.payment.exceptions import PaymentDeclinedError, PaymentGatewayError
from checkout.payment.gateway import PaymentGateway, get_payment_gateway
from checkout.payment.model import Payment
from checkout.payment.schemas import PaymentMethod, PaymentStatus, SimulatedOutcome

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self, session: Session, gateway: PaymentGateway) -> None:
        self._session = session
        self._gateway = gateway
        self._orders = OrderRepository(session)

    def pay(
        self,
        order_id: int,
        method: PaymentMethod,
        idempotency_key: str,
        simulated_outcome: SimulatedOutcome | None,
    ) -> Payment:
        logger.info("Payment attempt started for order %d (key=%s)", order_id, idempotency_key)

        with self._session.begin():
            order = self._orders.lock(order_id)

            existing = self._session.execute(
                select(Payment).where(Payment.idempotency_key == idempotency_key)
            ).scalar_one_or_none()
            if existing is not None:
                logger.info("Idempotent replay of payment key=%s", idempotency_key)
                outcome: Payment | None = existing
            else:
                if order.status != OrderStatus.PENDING:
                    raise OrderNotPayableError(order_id, order.status)

                if datetime.now(UTC) > order.expires_at:
                    order.status = OrderStatus.EXPIRED.value
                    release_stock(self._session, order)
                    outcome = None
                else:
                    if simulated_outcome is not None:
                        logger.info("Simulated outcome %s honored", simulated_outcome)

                    try:
                        result = self._gateway.charge(order.total, method, simulated_outcome)
                    except PaymentGatewayError:
                        logger.exception("Payment gateway error for order %d", order_id)
                        raise

                    payment = Payment(
                        order_id=order_id,
                        amount=order.total,
                        method=method.value,
                        status=result.status.value,
                        idempotency_key=idempotency_key,
                        decline_reason=result.decline_reason,
                        gateway_reference=result.gateway_reference,
                    )
                    self._session.add(payment)
                    self._session.flush()

                    if result.status == PaymentStatus.APPROVED:
                        order.status = OrderStatus.PAID.value
                        logger.info("Payment approved for order %d", order_id)
                    else:
                        logger.info(
                            "Payment declined for order %d: %s", order_id, result.decline_reason
                        )
                    outcome = payment

        if outcome is None:
            raise OrderExpiredError(order_id)
        if outcome.status == PaymentStatus.DECLINED:
            raise PaymentDeclinedError(outcome)
        return outcome


def get_payment_service(
    session: Annotated[Session, Depends(get_session)],
    gateway: Annotated[PaymentGateway, Depends(get_payment_gateway)],
) -> PaymentService:
    return PaymentService(session, gateway)
