from sqlalchemy.orm import Session
from ..models import CarHireRequest
from uuid import UUID

def create_carhire_request(db: Session, **kwargs):
    db_request = CarHireRequest(**kwargs)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_carhire_request(db: Session, request_id: UUID):
    return db.query(CarHireRequest).filter(CarHireRequest.id == request_id).first()

def get_user_carhire_requests(db: Session, user_id: UUID):
    return db.query(CarHireRequest).filter(CarHireRequest.user_id == user_id).all()

def get_all_carhire_requests(db: Session):
    return db.query(CarHireRequest).all()