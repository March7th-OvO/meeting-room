from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user
from app.core.responses import success_response
from app.db.session import get_db
from app.schemas.rooms import RoomCreate, RoomUpdate
from app.services.rooms import create_room, delete_room, get_room_detail, list_rooms, update_room

router = APIRouter(tags=["rooms"])
admin_router = APIRouter(prefix="/admin/rooms", tags=["admin-rooms"])


@router.get("/rooms")
def get_rooms(
    keyword: str | None = None,
    min_capacity: int | None = Query(default=None, ge=0),
    status: str | None = None,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response(
        list_rooms(db, keyword=keyword, min_capacity=min_capacity, status_filter=status)
    )


@router.get("/rooms/{room_id}")
def get_room(
    room_id: int,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return success_response(get_room_detail(db, room_id))


@admin_router.post("")
def post_room(
    payload: RoomCreate,
    _: object = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(create_room(db, payload))


@admin_router.patch("/{room_id}")
def patch_room(
    room_id: int,
    payload: RoomUpdate,
    _: object = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return success_response(update_room(db, room_id, payload))


@admin_router.delete("/{room_id}")
def remove_room(
    room_id: int,
    _: object = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    delete_room(db, room_id)
    return success_response(True)
