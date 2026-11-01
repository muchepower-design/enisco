from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_user, get_password_hash, require_role
from ..models import User
from ..schemas import UserResponse, UserCreate, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
def list_users(
    current_user: User = Depends(get_current_user),   # ✅ No require_role here
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    print(f" list_users called by {current_user.email}")
    print(f"   Role: '{current_user.role}'")
    print(f"   UserType: '{current_user.user_type}'")
    
    allowed = ["admin", "manager"]
    role_ok = current_user.role in allowed
    user_type_ok = current_user.user_type in allowed
    
    if not (role_ok or user_type_ok):
        print(f" Access denied for {current_user.email}")
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Your role: {current_user.role}, Required: {allowed}"
        )
    
    print(f" Access granted for {current_user.email}")
    users = db.query(User).offset(skip).limit(limit).all()
    for u in users:
        print(f"   User: {u.full_name} | Email: {u.email} | Role: {u.role} | Type: {u.user_type}")
    print(f"   Total users fetched: {len(users)}")
    return users

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    print(f" /me called by {current_user.email} | Role: {current_user.role} | Type: {current_user.user_type}")
    return current_user

@router.put("/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    print(f" Updating role for user {user_id} to {role} by {current_user.email}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    print(f" Role updated for {user.email}")
    return {"message": "Role updated"}

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    print(f" Creating new user by {current_user.email}")
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed_pw = get_password_hash(user.password)
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        password_hash=hashed_pw,
        user_type=user.user_type or "client",
        role=user.role or "client"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f" User created: {db_user.email} | Role: {db_user.role} | Type: {db_user.user_type}")
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: User = Depends(require_role(["admin","manager","sales_officer"])),
    db: Session = Depends(get_db)
):
    print(f" Fetching user {user_id} by {current_user.email}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    print(f"️ Updating user {user_id} by {current_user.email}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.phone is not None:
        user.phone = user_update.phone
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.user_type is not None:
        user.user_type = user_update.user_type
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.password:
        user.password_hash = get_password_hash(user_update.password)
    db.commit()
    db.refresh(user)
    print(f" User updated: {user.email} | Role: {user.role} | Type: {user.user_type}")
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    print(f"️ Deleting user {user_id} by {current_user.email}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    print(f" User deleted: {user.email}")
    return {"message": "User deleted successfully"}