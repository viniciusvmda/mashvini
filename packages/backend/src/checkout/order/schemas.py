from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, PositiveInt


class OrderStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class OrderLineIn(BaseModel):
    item_id: int
    quantity: PositiveInt


class OrderIn(BaseModel):
    lines: list[OrderLineIn] = Field(min_length=1)


class OrderLineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    quantity: int
    price: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    status: OrderStatus
    expires_at: datetime
    total: float
    lines: list[OrderLineOut]
