from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class PaymentMethod(StrEnum):
    CARD = "card"
    WALLET = "wallet"


class PaymentStatus(StrEnum):
    APPROVED = "approved"
    DECLINED = "declined"


class SimulatedOutcome(StrEnum):
    APPROVED = "approved"
    DECLINED = "declined"
    GATEWAY_ERROR = "gateway_error"


class PaymentIn(BaseModel):
    method: PaymentMethod
    simulated_outcome: SimulatedOutcome | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    amount: float
    method: str
    status: str
