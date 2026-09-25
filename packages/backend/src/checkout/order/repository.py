from collections import Counter
from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.catalog.exceptions import ItemNotFoundError
from checkout.catalog.model import Item
from checkout.database.session import get_session
from checkout.order.exceptions import ItemNotAvailableError
from checkout.order.model import Order, OrderLine
from checkout.order.schemas import OrderLineIn


class OrderRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, lines: list[OrderLineIn]) -> Order:
        quantities = Counter[int]()
        for line in lines:
            quantities[line.item_id] += line.quantity

        with self._session.begin():
            statement = (
                select(Item)
                .where(Item.id.in_(quantities.keys()))
                .order_by(Item.id)
                .with_for_update()
            )
            items = {item.id: item for item in self._session.execute(statement).scalars().all()}
            self._check_availability(items, quantities)

            for item_id, quantity in quantities.items():
                items[item_id].stock -= quantity

            order = Order(
                lines=[
                    OrderLine(
                        item_id=line.item_id,
                        quantity=line.quantity,
                        price=items[line.item_id].price,
                    )
                    for line in lines
                ]
            )
            self._session.add(order)
            self._session.flush()

        return order

    def _check_availability(self, items: dict[int, Item], quantities: Counter[int]) -> None:
        unavailable = []
        for item_id, quantity in quantities.items():
            item = items.get(item_id)
            if item is None:
                raise ItemNotFoundError(item_id)
            if item.stock < quantity:
                unavailable.append((item.name, item.stock))

        if unavailable:
            raise ItemNotAvailableError(unavailable)


def get_order_repository(session: Annotated[Session, Depends(get_session)]) -> OrderRepository:
    return OrderRepository(session)
