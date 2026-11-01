from sqlalchemy.orm import Session
from ..models import Quotation
from uuid import UUID

def create_quotation(db: Session, **kwargs):
    db_quote = Quotation(**kwargs)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

def update_quotation_status(db: Session, quotation_id: UUID, status: str):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if quote:
        quote.status = status
        db.commit()
        db.refresh(quote)
    return quote