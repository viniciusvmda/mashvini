from datetime import datetime

from sqlalchemy import ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from checkout.database.base import Base


class OrderLine(Base):
    __tablename__ = "order_lines"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), init=False)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    quantity: Mapped[int]
    price: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
    lines: Mapped[list[OrderLine]] = relationship(default_factory=list)
