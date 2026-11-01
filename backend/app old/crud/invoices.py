from sqlalchemy.orm import Session
from ..models import Invoice
from uuid import UUID

def create_invoice(db: Session, **kwargs):
    db_invoice = Invoice(**kwargs)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice_payment(db: Session, invoice_id: UUID, amount_paid: float):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if invoice:
        invoice.amount_paid += amount_paid
        invoice.balance = invoice.total_amount - invoice.amount_paid
        if invoice.balance <= 0:
            invoice.invoice_status = "paid"
        else:
            invoice.invoice_status = "part_paid"
        db.commit()
        db.refresh(invoice)
    return invoice