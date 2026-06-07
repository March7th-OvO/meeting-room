from datetime import datetime

from sqlalchemy import case, func, select
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
        .order_by(func.count(Booking.id).desc(), Room.name.asc())
        .limit(5)
    ).all()
    return [NamedValue(name=name, value=count).model_dump() for name, count in rows]


def get_room_status_counts(db: Session) -> list[dict]:
    rows = db.execute(
        select(Room.status, func.count(Room.id))
        .group_by(Room.status)
        .order_by(Room.status)
    ).all()
    return [NamedValue(name=name, value=count).model_dump() for name, count in rows]


def get_current_room_usage_counts(db: Session) -> list[dict]:
    now = datetime.now()
    current_date = now.date()
    current_time = now.time().replace(microsecond=0)

    in_use_case = func.max(
        case(
            (
                (Booking.booking_date == current_date)
                & (Booking.start_time <= current_time)
                & (Booking.end_time > current_time)
                & (Booking.status == "approved"),
                1,
            ),
            else_=0,
        )
    )
    under_review_case = func.max(
        case(
            (
                (Booking.booking_date == current_date)
                & (Booking.start_time <= current_time)
                & (Booking.end_time > current_time)
                & (Booking.status == "pending"),
                1,
            ),
            else_=0,
        )
    )

    rows = db.execute(
        select(Room.id, in_use_case.label("in_use"), under_review_case.label("under_review"))
        .select_from(Room)
        .join(Booking, Booking.room_id == Room.id, isouter=True)
        .group_by(Room.id)
    ).all()

    counts = {
        "in_use": 0,
        "under_review": 0,
        "idle": 0,
    }
    for _, in_use, under_review in rows:
        if in_use:
            counts["in_use"] += 1
        elif under_review:
            counts["under_review"] += 1
        else:
            counts["idle"] += 1

    return [
        NamedValue(name="in_use", value=counts["in_use"]).model_dump(),
        NamedValue(name="under_review", value=counts["under_review"]).model_dump(),
        NamedValue(name="idle", value=counts["idle"]).model_dump(),
    ]
