from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.bookings import BookingCreate
from app.services.bookings import cancel_booking, create_booking, list_my_bookings

router = APIRouter(tags=["bookings"])


@router.post("/bookings")
def post_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response(create_booking(db, payload, current_user))


@router.get("/bookings/me")
def my_bookings(
    status: str | None = None,
    booking_date_from: date | None = None,
    booking_date_to: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response(
        list_my_bookings(
            db,
            current_user,
            status_filter=status,
            booking_date_from=booking_date_from,
            booking_date_to=booking_date_to,
        )
    )


@router.patch("/bookings/{booking_id}/cancel")
def cancel_my_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response(cancel_booking(db, booking_id, current_user))
