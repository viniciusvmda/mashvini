from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "f7bc0b5f65de"
down_revision: str | Sequence[str] | None = "c9bf00712ea3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("status", sa.String(), nullable=False, server_default="paid"),
    )
    op.alter_column("orders", "status", server_default=None)

    op.add_column("orders", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE orders SET expires_at = created_at + INTERVAL '5 minutes'")
    op.alter_column("orders", "expires_at", nullable=False)

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("method", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("decline_reason", sa.String(), nullable=True),
        sa.Column("gateway_reference", sa.String(), nullable=True),
        sa.Column("idempotency_key", sa.String(), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_payments_order_id", "payments", ["order_id"])


def downgrade() -> None:
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_table("payments")
    op.drop_column("orders", "expires_at")
    op.drop_column("orders", "status")
