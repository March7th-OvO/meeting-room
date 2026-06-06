from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.bookings import BookingRepository
from app.repositories.rooms import RoomRepository
from app.schemas.rooms import RoomCreate, RoomResponse, RoomUpdate


def serialize_room(room) -> dict:
    return RoomResponse(
        id=room.id,
        name=room.name,
        capacity=room.capacity,
        status=room.status,
        location=room.location,
        description=room.description,
        equipment=[item.equipment_name for item in room.equipments],
    ).model_dump()


def list_rooms(db: Session, *, keyword: str | None = None, min_capacity: int | None = None, status_filter: str | None = None) -> list[dict]:
    rooms = RoomRepository(db).list(keyword=keyword, min_capacity=min_capacity, status=status_filter)
    return [serialize_room(room) for room in rooms]


def get_room_detail(db: Session, room_id: int) -> dict:
    room = RoomRepository(db).get(room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="room not found")
    return serialize_room(room)


def create_room(db: Session, payload: RoomCreate) -> dict:
    room = RoomRepository(db).create(**payload.model_dump())
    db.commit()
    return serialize_room(room)


def update_room(db: Session, room_id: int, payload: RoomUpdate) -> dict:
    repo = RoomRepository(db)
    room = repo.get(room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="room not found")
    room = repo.update(room, **payload.model_dump())
    db.commit()
    return serialize_room(room)


def delete_room(db: Session, room_id: int) -> None:
    repo = RoomRepository(db)
    room = repo.get(room_id)
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="room not found")
    if BookingRepository(db).has_active_bookings_for_room(room_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="room has active bookings and cannot be deleted",
        )
    repo.delete(room)
    db.commit()
