from sqlalchemy.orm import Session
from ..models import AirportTransferRequest
from uuid import UUID

def create_airporttransfer_request(db: Session, **kwargs):
    db_request = AirportTransferRequest(**kwargs)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_airporttransfer_request(db: Session, request_id: UUID):
    return db.query(AirportTransferRequest).filter(AirportTransferRequest.id == request_id).first()

def get_user_airporttransfer_requests(db: Session, user_id: UUID):
    return db.query(AirportTransferRequest).filter(AirportTransferRequest.user_id == user_id).all()

def get_all_airporttransfer_requests(db: Session):
    return db.query(AirportTransferRequest).all()