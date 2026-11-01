from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, Quotation, TravelRequest, InsuranceRequest, VisaRequest, FlightRequest, CarHireRequest, AirportTransferRequest
from ..schemas import QuotationCreate, QuotationResponse
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/quotations", tags=["quotations"])

@router.post("/", response_model=QuotationResponse)
def create_quotation(
    quote: QuotationCreate,
    current_user: User = Depends(require_role(["admin", "manager", "sales_officer"])),
    db: Session = Depends(get_db)
):
    # Determine request object based on type
    if quote.request_type == "travel":
        request_obj = db.query(TravelRequest).filter(TravelRequest.id == quote.request_id).first()
    elif quote.request_type == "insurance":
        request_obj = db.query(InsuranceRequest).filter(InsuranceRequest.id == quote.request_id).first()
    elif quote.request_type == "visa":
        request_obj = db.query(VisaRequest).filter(VisaRequest.id == quote.request_id).first()
    elif quote.request_type == "flight":
        request_obj = db.query(FlightRequest).filter(FlightRequest.id == quote.request_id).first()
    elif quote.request_type == "carhire":
        request_obj = db.query(CarHireRequest).filter(CarHireRequest.id == quote.request_id).first()
    elif quote.request_type == "airporttransfer":
        request_obj = db.query(AirportTransferRequest).filter(AirportTransferRequest.id == quote.request_id).first()
    else:
        raise HTTPException(status_code=400, detail=f"Invalid request type: {quote.request_type}")
    
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    quotation_ref = f"QTN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    
    # Get customer name based on type
    if quote.request_type == "travel":
        customer_name = request_obj.full_name
    elif quote.request_type == "insurance":
        customer_name = request_obj.buyer_name
    elif quote.request_type == "visa":
        customer_name = request_obj.applicant_name
    elif quote.request_type == "flight":
        customer_name = request_obj.full_name
    elif quote.request_type == "carhire":
        customer_name = request_obj.full_name
    elif quote.request_type == "airporttransfer":
        customer_name = request_obj.full_name
    else:
        customer_name = "Unknown"
    
    db_quote = Quotation(
        quotation_reference=quotation_ref,
        request_type=quote.request_type,
        request_id=quote.request_id,
        user_id=request_obj.user_id,
        customer_name=customer_name,
        customer_phone=request_obj.phone,
        customer_email=request_obj.email,
        quote_title=quote.quote_title,
        quote_details=quote.quote_details,
        base_amount=quote.base_amount,
        service_fee=quote.service_fee,
        total_amount=quote.total_amount,
        validity_date=quote.validity_date,
        created_by=current_user.id,
        payment_status="pending"
    )
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)

    # Update the original request's status to 'quotation_sent'
    # Each request type may have different status fields, but we'll try to set them consistently.
    # We'll use a mapping for each request type.
    if quote.request_type == "travel":
        request_obj.request_status = "quotation_sent"
    elif quote.request_type == "insurance":
        request_obj.request_status = "quote_generated"  # or "quotation_sent" depending on your enum
    elif quote.request_type == "visa":
        request_obj.request_status = "pending_review"  # or "quotation_sent" if you have it
    elif quote.request_type == "flight":
        request_obj.request_status = "quotation_sent"
    elif quote.request_type == "carhire":
        request_obj.request_status = "quotation_sent"
    elif quote.request_type == "airporttransfer":
        request_obj.request_status = "quotation_sent"
    # If you have a specific status for each, adjust accordingly.
    # If the request type doesn't have a "quotation_sent" enum, you may need to add it or use a suitable alternative.
    # For insurance, "quote_generated" already exists; for visa, "pending_review" might be appropriate.

    db.commit()
    return db_quote

@router.get("/", response_model=List[QuotationResponse])
def list_quotations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["admin", "manager", "sales_officer"]:
        return db.query(Quotation).all()
    else:
        return db.query(Quotation).filter(Quotation.user_id == current_user.id).all()

@router.patch("/{quotation_id}/accept")
def accept_quotation(quotation_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quote or quote.user_id != current_user.id:
        raise HTTPException(404, "Quotation not found")
    quote.status = "accepted"
    db.commit()
    return {"message": "accepted"}

@router.post("/{quotation_id}/send")
def send_quotation(quotation_id: UUID, current_user: User = Depends(require_role(["admin","manager","sales_officer"])), db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quote:
        raise HTTPException(404, "Quotation not found")
    quote.status = "sent"
    db.commit()
    return {"message": "sent"}

@router.post("/{quotation_id}/mark-paid")
def mark_quotation_paid(quotation_id: UUID, current_user: User = Depends(require_role(["admin","manager","finance_officer"])), db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quote:
        raise HTTPException(404, "Quotation not found")
    quote.payment_status = "paid"
    quote.status = "accepted"
    db.commit()
    return {"message": "marked paid"}

@router.get("/{quotation_id}", response_model=QuotationResponse)
def get_quotation(quotation_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quote:
        raise HTTPException(404, "Quotation not found")
    if quote.user_id != current_user.id and current_user.role not in ["admin", "manager", "sales_officer"]:
        raise HTTPException(403, "Access denied")
    return quote