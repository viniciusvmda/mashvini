import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from checkout.catalog.exceptions import ItemNotFoundError
from checkout.order.exceptions import (
    ItemNotAvailableError,
    OrderNotFoundError,
    OrderNotPayableError,
)
from checkout.order.repository import OrderRepository, get_order_repository
from checkout.order.schemas import OrderIn, OrderOut

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/orders", status_code=201)
def create_order(
    order_in: OrderIn,
    repository: Annotated[OrderRepository, Depends(get_order_repository)],
) -> OrderOut:
    logger.info("Creating order with %d lines", len(order_in.lines))
    try:
        order = repository.create(order_in.lines)
    except ItemNotFoundError:
        logger.info("Order creation failed: item not found")
        raise
    except ItemNotAvailableError:
        logger.info("Order creation failed: item(s) not available")
        raise
    logger.info("Order %d created", order.id)

    return OrderOut.model_validate(order)


@router.post("/orders/{order_id}/cancel")
def cancel_order(
    order_id: int,
    repository: Annotated[OrderRepository, Depends(get_order_repository)],
) -> OrderOut:
    logger.info("Cancelling order %d", order_id)
    try:
        order = repository.cancel(order_id)
    except OrderNotFoundError:
        logger.info("Cancel failed: order %d not found", order_id)
        raise
    except OrderNotPayableError:
        logger.info("Cancel failed: order %d is not payable", order_id)
        raise
    logger.info("Order %d cancelled (status=%s)", order_id, order.status)

    return OrderOut.model_validate(order)
