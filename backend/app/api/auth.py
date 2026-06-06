from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.schemas.auth import LoginRequest, UserProfile
from app.services.auth import authenticate_user

router = APIRouter(prefix="/auth", tags=["auth"])


def success_response(data):
    return {"code": 0, "message": "ok", "data": data}


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token = authenticate_user(db, payload.username, payload.password)
    return success_response(token.model_dump())


@router.get("/me")
def me(user=Depends(get_current_user)):
    return success_response(
        UserProfile(id=user.id, username=user.username, role=user.role).model_dump()
    )
