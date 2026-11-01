from sqlalchemy.orm import Session
from ..models import InsuranceRequest
from uuid import UUID
from datetime import datetime

def create_insurance_request(db: Session, **kwargs):
    db_request = InsuranceRequest(**kwargs)
    db_request.updated_at = db_request.created_at or datetime.utcnow()
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def update_insurance_request_status(db: Session, request_id: UUID, status: str):
    db_request = db.query(InsuranceRequest).filter(InsuranceRequest.id == request_id).first()
    if db_request:
        db_request.request_status = status
        db.commit()
        db.refresh(db_request)
    return db_request