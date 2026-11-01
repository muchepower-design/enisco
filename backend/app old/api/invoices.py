from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, Invoice, TravelRequest, InsuranceRequest
from ..schemas import InvoiceCreate, InvoiceResponse
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(require_role(["admin", "manager", "finance_officer"])),
    db: Session = Depends(get_db)
):
    if invoice.request_type == "travel":
        request_obj = db.query(TravelRequest).filter(TravelRequest.id == invoice.request_id).first()
    else:
        request_obj = db.query(InsuranceRequest).filter(InsuranceRequest.id == invoice.request_id).first()
    
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    invoice_ref = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    
    db_invoice = Invoice(
        invoice_reference=invoice_ref,
        request_type=invoice.request_type,
        request_id=invoice.request_id,
        user_id=request_obj.user_id,
        customer_name=request_obj.full_name if invoice.request_type == "travel" else request_obj.buyer_name,
        customer_phone=request_obj.phone,
        customer_email=request_obj.email,
        invoice_title=invoice.invoice_title,
        invoice_details=invoice.invoice_details,
        total_amount=invoice.total_amount,
        amount_paid=0,
        balance=invoice.total_amount,
        due_date=invoice.due_date,
        created_by=current_user.id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/unpaid")
def get_unpaid_invoices(current_user: User = Depends(require_role(["finance_officer", "admin", "manager"])), db: Session = Depends(get_db)):
    return db.query(Invoice).filter(Invoice.invoice_status.in_(['unpaid', 'part_paid'])).all()

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["admin", "manager", "finance_officer"]:
        return db.query(Invoice).all()
    else:
        return db.query(Invoice).filter(Invoice.user_id == current_user.id).all()