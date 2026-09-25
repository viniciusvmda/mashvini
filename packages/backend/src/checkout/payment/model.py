from datetime import datetime

from sqlalchemy import ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from checkout.database.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    amount: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    method: Mapped[str]
    status: Mapped[str]
    idempotency_key: Mapped[str] = mapped_column(unique=True)
    decline_reason: Mapped[str | None] = mapped_column(default=None)
    gateway_reference: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
