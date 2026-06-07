from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.bookings import BookingStatusUpdate
from app.services.bookings import approve_booking, list_admin_bookings
from app.services.statistics import (
    get_current_room_usage_counts,
    get_overview,
    get_room_status_counts,
    get_room_usage,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/bookings")
def get_bookings(
    status: str | None = None,
    room_id: int | None = None,
    user_id: int | None = None,
    booking_date_from: date | None = None,
    booking_date_to: date | None = None,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(
        list_admin_bookings(
            db,
            status_filter=status,
            room_id=room_id,
            user_id=user_id,
            booking_date_from=booking_date_from,
            booking_date_to=booking_date_to,
        )
    )


@router.patch("/bookings/{booking_id}/status")
def patch_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(approve_booking(db, booking_id, payload, current_user))


@router.get("/statistics/overview")
def overview(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(get_overview(db))


@router.get("/statistics/room-usage")
def room_usage(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(get_room_usage(db))


@router.get("/statistics/room-status")
def room_status(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(get_room_status_counts(db))


@router.get("/statistics/current-room-usage")
def current_room_usage(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(get_current_room_usage_counts(db))
