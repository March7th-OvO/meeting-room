"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-07 02:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_rooms_name", "rooms", ["name"], unique=True)
    op.create_index("ix_rooms_status", "rooms", ["status"], unique=False)

    op.create_table(
        "room_equipments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id"), nullable=False),
        sa.Column("equipment_name", sa.String(length=100), nullable=False),
    )
    op.create_index("ix_room_equipments_room_id", "room_equipments", ["room_id"], unique=False)

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("booking_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("purpose", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("approval_comment", sa.String(length=255), nullable=True),
        sa.Column("approved_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("approved_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_bookings_status", "bookings", ["status"], unique=False)
    op.create_index("ix_bookings_room_time", "bookings", ["room_id", "booking_date", "start_time", "end_time"], unique=False)
    op.create_index("ix_bookings_user_status", "bookings", ["user_id", "status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_bookings_user_status", table_name="bookings")
    op.drop_index("ix_bookings_room_time", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_table("bookings")
    op.drop_index("ix_room_equipments_room_id", table_name="room_equipments")
    op.drop_table("room_equipments")
    op.drop_index("ix_rooms_status", table_name="rooms")
    op.drop_index("ix_rooms_name", table_name="rooms")
    op.drop_table("rooms")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
