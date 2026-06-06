from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        return self.db.scalar(statement)

    def create(self, *, username: str, password_hash: str, role: str) -> User:
        user = User(username=username, password_hash=password_hash, role=role, is_active=True)
        self.db.add(user)
        self.db.flush()
        return user
