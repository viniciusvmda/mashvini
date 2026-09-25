import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Header

from checkout.order.exceptions import OrderExpiredError, OrderNotFoundError, OrderNotPayableError
from checkout.payment.exceptions import PaymentDeclinedError, PaymentGatewayError
from checkout.payment.schemas import PaymentIn, PaymentOut
from checkout.payment.service import PaymentService, get_payment_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/orders/{order_id}/payment")
def pay_order(
    order_id: int,
    payment_in: PaymentIn,
    idempotency_key: Annotated[str, Header()],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> PaymentOut:
    logger.info("Paying order %d with method %s", order_id, payment_in.method)
    try:
        payment = service.pay(
            order_id=order_id,
            method=payment_in.method,
            idempotency_key=idempotency_key,
            simulated_outcome=payment_in.simulated_outcome,
        )
    except OrderNotFoundError:
        logger.info("Payment failed: order %d not found", order_id)
        raise
    except OrderNotPayableError:
        logger.info("Payment failed: order %d is not payable", order_id)
        raise
    except OrderExpiredError:
        logger.info("Payment failed: order %d has expired", order_id)
        raise
    except PaymentDeclinedError:
        logger.info("Payment declined for order %d", order_id)
        raise
    except PaymentGatewayError:
        logger.info("Payment failed: gateway error for order %d", order_id)
        raise

    return PaymentOut.model_validate(payment)
