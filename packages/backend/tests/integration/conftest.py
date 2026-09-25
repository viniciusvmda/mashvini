import os
from collections.abc import Callable, Generator
from pathlib import Path

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from alembic import command
from checkout.catalog.model import Item
from checkout.config.env import get_settings
from checkout.database.session import get_engine
from checkout.main import create_app

BACKEND_DIR = Path(__file__).resolve().parents[2]


@pytest.fixture(scope="session", autouse=True)
def _test_database() -> Generator[None]:
    base_settings = get_settings()
    test_database_name = f"{base_settings.database_name}_test"
    os.environ["DATABASE_NAME"] = test_database_name
    get_settings.cache_clear()
    get_engine.cache_clear()

    admin_url = (
        f"postgresql+psycopg://{base_settings.database_user}:{base_settings.database_password}"
        f"@{base_settings.database_host}:{base_settings.database_port}/postgres"
    )
    admin_engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as connection:
        exists = connection.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": test_database_name},
        ).first()
        if exists is None:
            connection.execute(text(f'CREATE DATABASE "{test_database_name}"'))
    admin_engine.dispose()

    alembic_config = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(alembic_config, "head")

    yield

    get_engine().dispose()


@pytest.fixture(autouse=True)
def _reset_database() -> Generator[None]:
    with get_engine().connect() as connection:
        connection.execute(text("TRUNCATE order_lines, orders, items RESTART IDENTITY CASCADE"))
        connection.commit()
    yield


@pytest.fixture
def seed_items() -> Callable[..., list[Item]]:
    def seed(*items: Item) -> list[Item]:
        with Session(get_engine()) as session:
            session.add_all(items)
            session.commit()
            for item in items:
                session.refresh(item)
        return list(items)

    return seed


@pytest.fixture
def db_session() -> Generator[Session]:
    with Session(get_engine()) as session:
        yield session


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())
