from collections.abc import Sequence
from typing import Annotated

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from checkout.catalog.model import Item
from checkout.database.session import get_session


class ItemRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_page(self, page: int, size: int) -> Sequence[Item]:
        statement = select(Item).order_by(Item.id).offset(page * size).limit(size)
        return self._session.execute(statement).scalars().all()

    def count(self) -> int:
        statement = select(func.count()).select_from(Item)
        return self._session.execute(statement).scalar_one()


def get_item_repository(session: Annotated[Session, Depends(get_session)]) -> ItemRepository:
    return ItemRepository(session)
