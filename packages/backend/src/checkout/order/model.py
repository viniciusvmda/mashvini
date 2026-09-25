from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from checkout.database.base import Base
from checkout.order.schemas import OrderStatus


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
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(default=OrderStatus.PENDING.value)
    lines: Mapped[list[OrderLine]] = relationship(default_factory=list)

    @property
    def total(self) -> float:
        return round(sum(line.price * line.quantity for line in self.lines), 2)
