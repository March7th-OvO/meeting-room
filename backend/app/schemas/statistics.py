from pydantic import BaseModel


class OverviewStats(BaseModel):
    room_count: int
    approved_booking_count: int
    pending_booking_count: int


class NamedValue(BaseModel):
    name: str
    value: int
