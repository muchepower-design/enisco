from sqlalchemy.orm import Session
from ..models import FlightRequest
from uuid import UUID

def create_flight_request(db: Session, **kwargs):
    db_request = FlightRequest(**kwargs)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_flight_request(db: Session, request_id: UUID):
    return db.query(FlightRequest).filter(FlightRequest.id == request_id).first()

def update_flight_request_status(db: Session, request_id: UUID, status: str):
    db_request = db.query(FlightRequest).filter(FlightRequest.id == request_id).first()
    if db_request:
        db_request.request_status = status
        db.commit()
        db.refresh(db_request)
    return db_request

def get_user_flight_requests(db: Session, user_id: UUID):
    return db.query(FlightRequest).filter(FlightRequest.user_id == user_id).all()

def get_all_flight_requests(db: Session):
    return db.query(FlightRequest).all()