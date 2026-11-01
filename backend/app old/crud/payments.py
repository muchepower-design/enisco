from sqlalchemy.orm import Session
from ..models import Payment

def create_payment(db: Session, **kwargs):
    db_payment = Payment(**kwargs)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_payment_status(db: Session, payment_reference: str, status: str, gateway_ref: str = None):
    payment = db.query(Payment).filter(Payment.payment_reference == payment_reference).first()
    if payment:
        payment.payment_status = status
        if gateway_ref:
            payment.gateway_reference = gateway_ref
        db.commit()
        db.refresh(payment)
    return payment