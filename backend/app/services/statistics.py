from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.room import Room
from app.schemas.statistics import NamedValue, OverviewStats


def get_overview(db: Session) -> dict:
    room_count = db.scalar(select(func.count(Room.id))) or 0
    approved_booking_count = db.scalar(
        select(func.count(Booking.id)).where(Booking.status == "approved")
    ) or 0
    pending_booking_count = db.scalar(
        select(func.count(Booking.id)).where(Booking.status == "pending")
    ) or 0
    return OverviewStats(
        room_count=room_count,
        approved_booking_count=approved_booking_count,
        pending_booking_count=pending_booking_count,
    ).model_dump()


def get_room_usage(db: Session) -> list[dict]:
    rows = db.execute(
        select(Room.name, func.count(Booking.id))
        .select_from(Room)
        .join(Booking, Booking.room_id == Room.id, isouter=True)
        .group_by(Room.id)
        .order_by(Room.id)
    ).all()
    return [NamedValue(name=name, value=count).model_dump() for name, count in rows]


def get_booking_status_counts(db: Session) -> list[dict]:
    rows = db.execute(
        select(Booking.status, func.count(Booking.id))
        .group_by(Booking.status)
        .order_by(Booking.status)
    ).all()
    return [NamedValue(name=name, value=count).model_dump() for name, count in rows]
