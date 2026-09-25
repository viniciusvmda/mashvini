import asyncio
import logging
from collections.abc import Callable
from contextlib import AbstractContextManager
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.order.model import Order
from checkout.order.schemas import OrderStatus
from checkout.order.stock import release_stock

logger = logging.getLogger(__name__)


def expire_overdue_orders(session: Session) -> int:
    with session.begin():
        statement = (
            select(Order)
            .where(Order.status == OrderStatus.PENDING.value)
            .where(Order.expires_at < datetime.now(UTC))
            .with_for_update(skip_locked=True)
        )
        overdue_orders = session.execute(statement).scalars().all()

        for order in overdue_orders:
            order.status = OrderStatus.EXPIRED.value
            release_stock(session, order)

    logger.info("Expired %d overdue order(s)", len(overdue_orders))
    return len(overdue_orders)


async def run_expiry_sweep(
    session_factory: Callable[[], AbstractContextManager[Session]],
    interval_seconds: int = 60,
) -> None:
    while True:
        await asyncio.sleep(interval_seconds)
        try:
            with session_factory() as session:
                await asyncio.to_thread(expire_overdue_orders, session)
        except Exception:
            logger.exception("Expiry sweep failed")
