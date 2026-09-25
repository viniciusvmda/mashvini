from collections.abc import Sequence

from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from checkout.catalog.model import Item
from checkout.catalog.repository import ItemRepository, get_item_repository
from checkout.main import create_app


class FakeItemRepository:
    def __init__(self, items: list[Item]) -> None:
        self._items = items

    def list_page(self, page: int, size: int) -> Sequence[Item]:
        start = page * size
        return self._items[start : start + size]

    def count(self) -> int:
        return len(self._items)


class FailingItemRepository:
    def list_page(self, page: int, size: int) -> Sequence[Item]:
        raise SQLAlchemyError("boom")

    def count(self) -> int:
        raise SQLAlchemyError("boom")


def _client(repository: ItemRepository | FakeItemRepository | FailingItemRepository) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_item_repository] = lambda: repository
    return TestClient(app)


def _make_item(item_id: int, stock: int = 5) -> Item:
    item = Item(
        name=f"Item {item_id}", price=1.5, stock=stock, image_url="https://example.com/img.png"
    )
    item.id = item_id
    return item


def test_empty_table_returns_empty_page() -> None:
    client = _client(FakeItemRepository([]))

    response = client.get("/items", params={"page": 0, "size": 2})

    assert response.status_code == 200
    assert response.json() == {"page": 0, "size": 2, "total": 0, "data": []}


def test_first_page_returns_first_items_ordered_by_id() -> None:
    items = [_make_item(1), _make_item(2), _make_item(3)]
    client = _client(FakeItemRepository(items))

    response = client.get("/items", params={"page": 0, "size": 2})

    body = response.json()
    assert response.status_code == 200
    assert body["page"] == 0
    assert body["size"] == 2
    assert body["total"] == 3
    assert [item["id"] for item in body["data"]] == [1, 2]


def test_second_page_returns_remaining_item() -> None:
    items = [_make_item(1), _make_item(2), _make_item(3)]
    client = _client(FakeItemRepository(items))

    response = client.get("/items", params={"page": 1, "size": 2})

    body = response.json()
    assert response.status_code == 200
    assert body["total"] == 3
    assert [item["id"] for item in body["data"]] == [3]


def test_page_beyond_data_returns_empty_data() -> None:
    items = [_make_item(1), _make_item(2), _make_item(3)]
    client = _client(FakeItemRepository(items))

    response = client.get("/items", params={"page": 2, "size": 2})

    body = response.json()
    assert response.status_code == 200
    assert body["total"] == 3
    assert body["data"] == []


def test_item_with_no_stock_is_returned_with_stock_zero() -> None:
    items = [_make_item(1, stock=0)]
    client = _client(FakeItemRepository(items))

    response = client.get("/items", params={"page": 0, "size": 12})

    body = response.json()
    assert response.status_code == 200
    assert body["data"][0]["stock"] == 0
    assert body["data"][0]["price"] == 1.5


def test_repository_error_returns_500() -> None:
    client = _client(FailingItemRepository())

    response = client.get("/items")

    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to retrieve items"}


def test_negative_page_returns_422() -> None:
    client = _client(FakeItemRepository([]))

    response = client.get("/items", params={"page": -1, "size": 12})

    assert response.status_code == 422


def test_size_zero_returns_422() -> None:
    client = _client(FakeItemRepository([]))

    response = client.get("/items", params={"page": 0, "size": 0})

    assert response.status_code == 422


def test_size_above_maximum_returns_422() -> None:
    client = _client(FakeItemRepository([]))

    response = client.get("/items", params={"page": 0, "size": 101})

    assert response.status_code == 422
