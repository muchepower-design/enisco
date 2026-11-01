from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, TravelRequest, InsuranceRequest, VisaRequest, FlightRequest, CarHireRequest, AirportTransferRequest

router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.get("/pending")
def get_pending_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Allow all staff roles
    if current_user.role not in ['sales_officer', 'finance_officer', 'operations_manager', 'admin', 'manager']:
        return []  # or raise 403

    # Travel requests
    pending_travel = db.query(TravelRequest).filter(
        TravelRequest.request_status.in_(['request_received', 'quotation_sent', 'awaiting_payment'])
    ).all()

    # Insurance requests
    pending_insurance = db.query(InsuranceRequest).filter(
        InsuranceRequest.request_status.in_(['quote_generated', 'awaiting_payment'])
    ).all()

    # Visa requests
    pending_visa = db.query(VisaRequest).filter(
        VisaRequest.request_status.in_(['pending_review', 'documents_required'])
    ).all()

    # Flight requests
    pending_flight = db.query(FlightRequest).filter(
        FlightRequest.request_status.in_(['pending_quote', 'quotation_sent', 'awaiting_payment'])
    ).all()

    # Car hire requests
    pending_carhire = db.query(CarHireRequest).filter(
        CarHireRequest.request_status.in_(['pending_quote', 'quotation_sent', 'awaiting_payment'])
    ).all()

    # Airport transfer requests
    pending_airporttransfer = db.query(AirportTransferRequest).filter(
        AirportTransferRequest.request_status.in_(['pending_quote', 'quotation_sent', 'awaiting_payment'])
    ).all()

    result = []

    # Format travel
    for r in pending_travel:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.full_name,
            "service_type": r.service_type,
            "request_status": r.request_status,
            "request_type": "travel",
            "created_at": r.created_at
        })

    # Format insurance
    for r in pending_insurance:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.buyer_name,
            "service_type": "insurance",
            "request_status": r.request_status,
            "request_type": "insurance",
            "created_at": r.created_at
        })

    # Format visa
    for r in pending_visa:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.applicant_name,
            "service_type": "visa",
            "request_status": r.request_status,
            "request_type": "visa",
            "created_at": r.created_at
        })

    # Format flight
    for r in pending_flight:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.full_name,
            "service_type": "flight",
            "request_status": r.request_status,
            "request_type": "flight",
            "created_at": r.created_at
        })

    # Format car hire
    for r in pending_carhire:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.full_name,
            "service_type": "carhire",
            "request_status": r.request_status,
            "request_type": "carhire",
            "created_at": r.created_at
        })

    # Format airport transfer
    for r in pending_airporttransfer:
        result.append({
            "id": str(r.id),
            "request_reference": r.request_reference,
            "full_name": r.full_name,
            "service_type": "airporttransfer",
            "request_status": r.request_status,
            "request_type": "airporttransfer",
            "created_at": r.created_at
        })

    # Sort by creation date descending
    result.sort(key=lambda x: x['created_at'], reverse=True)
    return result