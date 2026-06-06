from typing import Literal

from pydantic import BaseModel, Field

RoomStatus = Literal["available", "maintenance"]


class RoomBase(BaseModel):
    name: str
    capacity: int = Field(ge=1)
    status: RoomStatus
    location: str | None = None
    description: str | None = None
    equipment: list[str] = Field(default_factory=list)


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = Field(default=None, ge=1)
    status: RoomStatus | None = None
    location: str | None = None
    description: str | None = None
    equipment: list[str] | None = None


class RoomResponse(RoomBase):
    id: int
