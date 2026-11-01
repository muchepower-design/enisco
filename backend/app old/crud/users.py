from sqlalchemy.orm import Session
from ..models import User
from ..auth import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, full_name: str, email: str, phone: str, password: str, user_type: str = "client", role: str = "client"):
    hashed_pw = get_password_hash(password)
    db_user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=hashed_pw,
        user_type=user_type,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_role(db: Session, user_id: str, role: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.role = role
        db.commit()
        db.refresh(user)
    return user