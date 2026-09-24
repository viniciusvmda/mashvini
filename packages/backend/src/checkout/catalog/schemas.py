from pydantic import BaseModel, ConfigDict


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: float
    stock: int
    image_url: str


class ItemPageOut(BaseModel):
    page: int
    size: int
    total: int
    data: list[ItemOut]
