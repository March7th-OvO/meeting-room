from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.room import Room
from app.models.room_equipment import RoomEquipment


class RoomRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, *, keyword: str | None = None, min_capacity: int | None = None, status: str | None = None) -> list[Room]:
        statement = select(Room).options(selectinload(Room.equipments)).order_by(Room.id)
        if keyword:
            statement = statement.where(Room.name.ilike(f"%{keyword}%"))
        if min_capacity is not None:
            statement = statement.where(Room.capacity >= min_capacity)
        if status:
            statement = statement.where(Room.status == status)
        return list(self.db.scalars(statement).all())

    def get(self, room_id: int) -> Room | None:
        statement = select(Room).options(selectinload(Room.equipments)).where(Room.id == room_id)
        return self.db.scalar(statement)

    def create(self, *, name: str, capacity: int, status: str, location: str | None, description: str | None, equipment: list[str]) -> Room:
        room = Room(name=name, capacity=capacity, status=status, location=location, description=description)
        room.equipments = [RoomEquipment(equipment_name=item) for item in equipment]
        self.db.add(room)
        self.db.flush()
        self.db.refresh(room)
        return self.get(room.id)  # type: ignore[return-value]

    def update(self, room: Room, *, name: str | None, capacity: int | None, status: str | None, location: str | None, description: str | None, equipment: list[str] | None) -> Room:
        if name is not None:
            room.name = name
        if capacity is not None:
            room.capacity = capacity
        if status is not None:
            room.status = status
        if location is not None:
            room.location = location
        if description is not None:
            room.description = description
        if equipment is not None:
            room.equipments.clear()
            room.equipments.extend(RoomEquipment(equipment_name=item) for item in equipment)
        self.db.flush()
        self.db.refresh(room)
        return self.get(room.id)  # type: ignore[return-value]

    def delete(self, room: Room) -> None:
        self.db.delete(room)
