from pydantic import BaseModel, Field


class RoomBase(BaseModel):
    name: str
    capacity: int = Field(ge=1)
    status: str
    location: str | None = None
    description: str | None = None
    equipment: list[str] = []


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = Field(default=None, ge=1)
    status: str | None = None
    location: str | None = None
    description: str | None = None
    equipment: list[str] | None = None


class RoomResponse(RoomBase):
    id: int
