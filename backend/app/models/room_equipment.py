from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RoomEquipment(Base):
    __tablename__ = "room_equipments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), index=True)
    equipment_name: Mapped[str] = mapped_column(String(100))

    room = relationship("Room", back_populates="equipments")
