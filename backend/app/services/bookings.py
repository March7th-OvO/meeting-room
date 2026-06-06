from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.bookings import BookingRepository
from app.repositories.rooms import RoomRepository
from app.schemas.bookings import BookingCreate, BookingResponse, BookingStatusUpdate


def serialize_booking(booking) -> dict:
    return BookingResponse(
        id=booking.id,
        room_id=booking.room_id,
        user_id=booking.user_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        purpose=booking.purpose,
        status=booking.status,
        approval_comment=booking.approval_comment,
        approved_by=booking.approved_by,
        approved_at=booking.approved_at,
    ).model_dump(mode="json")


def _validate_booking_payload(db: Session, payload: BookingCreate, booking_id: int | None = None) -> None:
    room = RoomRepository(db).get(payload.room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="room not found")
    if room.status != "available":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="room is under maintenance")
    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid time range")
    if payload.booking_date < date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="booking date is in the past")
    if BookingRepository(db).has_conflict(
        room_id=payload.room_id,
        booking_date=payload.booking_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        exclude_booking_id=booking_id,
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="booking time conflicts")


def create_booking(db: Session, payload: BookingCreate, current_user: User) -> dict:
    _validate_booking_payload(db, payload)
    status_value = "approved" if current_user.role == "admin" else "pending"
    approved_by = current_user.id if current_user.role == "admin" else None
    booking = BookingRepository(db).create(
        **payload.model_dump(),
        user_id=current_user.id,
        status=status_value,
        approved_by=approved_by,
    )
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)


def list_my_bookings(
    db: Session,
    current_user: User,
    *,
    status_filter: str | None = None,
    booking_date_from: date | None = None,
    booking_date_to: date | None = None,
) -> list[dict]:
    bookings = BookingRepository(db).list_for_user(
        current_user.id,
        status=status_filter,
        booking_date_from=booking_date_from,
        booking_date_to=booking_date_to,
    )
    return [serialize_booking(booking) for booking in bookings]


def list_admin_bookings(
    db: Session,
    *,
    status_filter: str | None = None,
    room_id: int | None = None,
    user_id: int | None = None,
    booking_date_from: date | None = None,
    booking_date_to: date | None = None,
) -> list[dict]:
    return [
        serialize_booking(booking)
        for booking in BookingRepository(db).list_all(
            status=status_filter,
            room_id=room_id,
            user_id=user_id,
            booking_date_from=booking_date_from,
            booking_date_to=booking_date_to,
        )
    ]


def cancel_booking(db: Session, booking_id: int, current_user: User) -> dict:
    booking = BookingRepository(db).get(booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="booking not found")
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
    if booking.status not in {"pending", "approved"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="booking cannot be cancelled")
    booking.status = "cancelled"
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)


def approve_booking(db: Session, booking_id: int, payload: BookingStatusUpdate, current_user: User) -> dict:
    booking = BookingRepository(db).get(booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="booking not found")
    if booking.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="only pending bookings can be updated")
    if payload.status not in {"approved", "rejected"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid status")
    if payload.status == "approved" and BookingRepository(db).has_conflict(
        room_id=booking.room_id,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        exclude_booking_id=booking.id,
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="booking time conflicts")
    booking.status = payload.status
    booking.approval_comment = payload.approval_comment
    booking.approved_by = current_user.id
    booking.approved_at = datetime.utcnow()
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)
