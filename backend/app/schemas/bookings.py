from datetime import date, datetime, time

from pydantic import BaseModel


class BookingCreate(BaseModel):
    room_id: int
    booking_date: date
    start_time: time
    end_time: time
    purpose: str


class BookingStatusUpdate(BaseModel):
    status: str
    approval_comment: str | None = None


class BookingResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    booking_date: date
    start_time: time
    end_time: time
    purpose: str
    status: str
    approval_comment: str | None = None
    approved_by: int | None = None
    approved_at: datetime | None = None
