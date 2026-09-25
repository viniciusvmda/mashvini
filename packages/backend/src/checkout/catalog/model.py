from datetime import datetime

from sqlalchemy import Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from checkout.database.base import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True, init=False)
    name: Mapped[str]
    price: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False))
    stock: Mapped[int]
    image_url: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
