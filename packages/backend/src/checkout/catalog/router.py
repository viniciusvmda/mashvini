import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError

from checkout.catalog.repository import ItemRepository, get_item_repository
from checkout.catalog.schemas import ItemOut, ItemPageOut

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/items")
def list_items(
    repository: Annotated[ItemRepository, Depends(get_item_repository)],
    page: Annotated[int, Query(ge=0)] = 0,
    size: Annotated[int, Query(ge=1, le=100)] = 12,
) -> ItemPageOut:
    try:
        logger.info("Getting items page=%d size=%d", page, size)
        items = repository.list_page(page, size)
        total = repository.count()
        logger.info("Found %d items (total=%d)", len(items), total)
    except SQLAlchemyError:
        logger.exception("Failed to retrieve items")
        raise HTTPException(status_code=500, detail="Failed to retrieve items") from None

    return ItemPageOut(
        page=page,
        size=size,
        total=total,
        data=[ItemOut.model_validate(item) for item in items],
    )
