from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a6d899d3f457"
down_revision: str | Sequence[str] | None = "829c70be5700"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ITEMS = [
    {
        "name": "Voss water",
        "price": 9.00,
        "stock": 12,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/01-voss-water.png",
    },
    {
        "name": "Guaraná Antártica",
        "price": 1.00,
        "stock": 0,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/02-guarana-antartica.png",
    },
    {
        "name": "Xeque Mate",
        "price": 1.50,
        "stock": 8,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/03-xeque-mate.png",
    },
    {
        "name": "Mentos",
        "price": 0.20,
        "stock": 20,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/04-mentos.png",
    },
    {
        "name": "Halls",
        "price": 0.10,
        "stock": 0,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/05-halls.png",
    },
    {
        "name": "Trident",
        "price": 0.15,
        "stock": 15,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/06-trident.png",
    },
    {
        "name": "Oreo",
        "price": 1.00,
        "stock": 6,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/07-oreo.png",
    },
    {
        "name": "Aritana Popcorn",
        "price": 0.90,
        "stock": 0,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/08-aritana-popcorn.png",
    },
    {
        "name": "Doritos",
        "price": 1.50,
        "stock": 10,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/09-doritos.png",
    },
    {
        "name": "Pringles",
        "price": 2.00,
        "stock": 5,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/10-pringles.png",
    },
    {
        "name": "Ruffles",
        "price": 1.30,
        "stock": 9,
        "image_url": "https://raw.githubusercontent.com/viniciusvmda/mashvini/main/medias/11-ruffles.png",
    },
]

items = sa.table(
    "items",
    sa.column("name", sa.String()),
    sa.column("price", sa.Numeric(10, 2)),
    sa.column("stock", sa.Integer()),
    sa.column("image_url", sa.String()),
)


def upgrade() -> None:
    op.bulk_insert(items, ITEMS)


def downgrade() -> None:
    names = [item["name"] for item in ITEMS]
    op.execute(items.delete().where(items.c.name.in_(names)))
