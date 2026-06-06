from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories.users import UserRepository
from app.schemas.auth import TokenResponse, UserProfile


def authenticate_user(db: Session, username: str, password: str) -> TokenResponse:
    user = UserRepository(db).get_by_username(username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid username or password",
        )

    token = create_access_token(str(user.id))
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(id=user.id, username=user.username, role=user.role),
    )
