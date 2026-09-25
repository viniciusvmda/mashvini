import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from checkout.catalog.exceptions import ItemNotFoundError
from checkout.order.exceptions import ItemNotAvailableError
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
