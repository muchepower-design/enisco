from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        print("JWT Payload:", payload)

        user_id = payload.get("sub")

        user = db.query(User).filter(User.id == user_id).first()

        print("Database User:", user)

        if user:
            print("Role:", user.role)
            print("User Type:", user.user_type)
            print("Active:", user.is_active)

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError as e:
        print("JWT ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_roles: list):
    async def role_checker(current_user: User = Depends(get_current_user)):

        print("Required:", required_roles)
        print("Current role:", current_user.role)
        print("Current user_type:", current_user.user_type)

        if (
            current_user.role not in required_roles
            and current_user.user_type not in required_roles
        ):
            print("ACCESS DENIED")
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )

        print("ACCESS GRANTED")

        return current_user

    return role_checker
    