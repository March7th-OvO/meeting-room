from __future__ import annotations

from datetime import date, time

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking


class BookingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_for_user(
        self,
        user_id: int,
        *,
        status: str | None = None,
        booking_date_from: date | None = None,
        booking_date_to: date | None = None,
    ) -> list[Booking]:
        statement = select(Booking).where(Booking.user_id == user_id)
        if status:
          statement = statement.where(Booking.status == status)
        if booking_date_from:
          statement = statement.where(Booking.booking_date >= booking_date_from)
        if booking_date_to:
          statement = statement.where(Booking.booking_date <= booking_date_to)
        statement = statement.order_by(Booking.booking_date.desc(), Booking.start_time.desc())
        return list(self.db.scalars(statement).all())

    def list_all(
        self,
        *,
        status: str | None = None,
        room_id: int | None = None,
        user_id: int | None = None,
        booking_date_from: date | None = None,
        booking_date_to: date | None = None,
    ) -> list[Booking]:
        statement = select(Booking)
        if status:
            statement = statement.where(Booking.status == status)
        if room_id is not None:
            statement = statement.where(Booking.room_id == room_id)
        if user_id is not None:
            statement = statement.where(Booking.user_id == user_id)
        if booking_date_from:
            statement = statement.where(Booking.booking_date >= booking_date_from)
        if booking_date_to:
            statement = statement.where(Booking.booking_date <= booking_date_to)
        statement = statement.order_by(Booking.booking_date.desc(), Booking.start_time.desc())
        return list(self.db.scalars(statement).all())

    def get(self, booking_id: int) -> Booking | None:
        return self.db.get(Booking, booking_id)

    def create(
        self,
        *,
        room_id: int,
        user_id: int,
        booking_date: date,
        start_time: time,
        end_time: time,
        purpose: str,
        status: str,
        approved_by: int | None = None,
        approval_comment: str | None = None,
    ) -> Booking:
        booking = Booking(
            room_id=room_id,
            user_id=user_id,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,
            purpose=purpose,
            status=status,
            approved_by=approved_by,
            approval_comment=approval_comment,
            approved_at=func.now() if approved_by is not None else None,
        )
        self.db.add(booking)
        self.db.flush()
        self.db.refresh(booking)
        return booking

    def has_conflict(self, *, room_id: int, booking_date: date, start_time: time, end_time: time, exclude_booking_id: int | None = None) -> bool:
        statement = select(Booking.id).where(
            Booking.room_id == room_id,
            Booking.booking_date == booking_date,
            Booking.status.in_(["pending", "approved"]),
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
        if exclude_booking_id is not None:
            statement = statement.where(Booking.id != exclude_booking_id)
        return self.db.scalar(statement) is not None

    def has_active_bookings_for_room(self, room_id: int) -> bool:
        statement = select(Booking.id).where(
            Booking.room_id == room_id,
            Booking.status.in_(["pending", "approved"]),
        )
        return self.db.scalar(statement) is not None
