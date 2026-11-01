# backend/app/crud/travel.py
from sqlalchemy.orm import Session
from ..models import TravelRequest
from uuid import UUID

def create_travel_request(db: Session, **kwargs):
    db_request = TravelRequest(**kwargs)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def update_travel_request_status(db: Session, request_id: str, status: str):
    db_request = db.query(TravelRequest).filter(TravelRequest.id == UUID(request_id)).first()
    if db_request:
        db_request.request_status = status
        db.commit()
        db.refresh(db_request)
    return db_request

