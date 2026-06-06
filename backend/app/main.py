from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.bookings import router as bookings_router
from app.api.rooms import admin_router as admin_rooms_router
from app.api.rooms import router as rooms_router
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import get_engine, get_session_local
from app.models import Room, RoomEquipment, User


def seed_data() -> None:
    with get_session_local()() as db:
        admin_exists = db.scalar(select(User.id).where(User.username == "admin"))
        if not admin_exists:
            demo_users = [
                User(username="user1", password_hash=get_password_hash("123456"), role="user"),
                User(username="user2", password_hash=get_password_hash("123456"), role="user"),
                User(username="admin", password_hash=get_password_hash("123456"), role="admin"),
            ]
            db.add_all(demo_users)

        room_exists = db.scalar(select(Room.id).limit(1))
        if not room_exists:
            rooms = [
                Room(
                    name="Boardroom A",
                    capacity=20,
                    status="available",
                    equipments=[
                        RoomEquipment(equipment_name="Projector"),
                        RoomEquipment(equipment_name="Whiteboard"),
                        RoomEquipment(equipment_name="Video Conferencing"),
                    ],
                ),
                Room(
                    name="Meeting Room B",
                    capacity=8,
                    status="available",
                    equipments=[
                        RoomEquipment(equipment_name="Whiteboard"),
                        RoomEquipment(equipment_name="TV"),
                    ],
                ),
                Room(
                    name="Huddle Room C",
                    capacity=4,
                    status="available",
                    equipments=[RoomEquipment(equipment_name="Whiteboard")],
                ),
                Room(
                    name="Conference Room D",
                    capacity=15,
                    status="maintenance",
                    equipments=[
                        RoomEquipment(equipment_name="Projector"),
                        RoomEquipment(equipment_name="Polycom"),
                    ],
                ),
            ]
            db.add_all(rooms)

        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=get_engine())
    seed_data()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(rooms_router, prefix=settings.api_prefix)
    app.include_router(bookings_router, prefix=settings.api_prefix)
    app.include_router(admin_router, prefix=settings.api_prefix)
    app.include_router(admin_rooms_router, prefix=settings.api_prefix)
    return app


app = create_app()
