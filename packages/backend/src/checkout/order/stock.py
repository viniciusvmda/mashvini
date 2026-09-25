from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.order.model import Order


def release_stock(session: Session, order: Order) -> None:
    quantities = Counter[int]()
    for line in order.lines:
        quantities[line.item_id] += line.quantity

    statement = (
        select(Item).where(Item.id.in_(quantities.keys())).order_by(Item.id).with_for_update()
    )
    items = {item.id: item for item in session.execute(statement).scalars().all()}

    for item_id, quantity in quantities.items():
        items[item_id].stock += quantity
