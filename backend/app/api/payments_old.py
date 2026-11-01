from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, Payment, Invoice, TravelRequest, InsuranceRequest, Quotation, FlightRequest, CarHireRequest, AirportTransferRequest, VisaRequest
from ..schemas import PaymentInitiate, PaymentResponse
from ..utils.payments import create_payment_intent, verify_payment
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/initiate", response_model=PaymentResponse)
def initiate_payment(
    payment_data: PaymentInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment_ref = f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

    payment = Payment(
        payment_reference=payment_ref,
        request_type=payment_data.request_type,
        request_id=payment_data.request_id,
        user_id=current_user.id,
        customer_name=payment_data.customer_name,
        customer_phone=payment_data.customer_phone,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        payment_status="pending",
        invoice_id=None
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Mock payment intent
    mock_payment_intent = {
        "id": f"mock_{payment_ref}",
        "status": "requires_confirmation",
        "client_secret": f"mock_secret_{payment_ref}"
    }

    return PaymentResponse(
        payment_reference=payment_ref,
        gateway_reference=mock_payment_intent.get("id"),
        client_secret=mock_payment_intent.get("client_secret"),
        status="pending"
    )

@router.post("/webhook/mock")
async def mock_payment_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    data = await request.json()
    payment_reference = data.get("payment_reference")

    payment = db.query(Payment).filter(Payment.payment_reference == payment_reference).first()
    if payment:
        payment.payment_status = "paid"
        payment.gateway_reference = data.get("transaction_id")
        db.commit()

        # Update related entity
        if payment.request_type == "travel":
            travel_req = db.query(TravelRequest).filter(TravelRequest.id == payment.request_id).first()
            if travel_req:
                travel_req.payment_status = "paid"
                travel_req.request_status = "confirmed_booking"
        elif payment.request_type == "insurance":
            insurance_req = db.query(InsuranceRequest).filter(InsuranceRequest.id == payment.request_id).first()
            if insurance_req:
                insurance_req.payment_status = "paid"
                insurance_req.request_status = "active_cover"
        elif payment.request_type == "quotation":
            # First, get the quotation
            quote = db.query(Quotation).filter(Quotation.id == payment.request_id).first()
            if quote:
                quote.payment_status = "paid"
                quote.status = "accepted"
                db.commit()

                # Now update the original request based on the quotation's request_type and request_id
                original_request_id = quote.request_id
                original_request_type = quote.request_type

                if original_request_type == "travel":
                    req = db.query(TravelRequest).filter(TravelRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "confirmed_booking"
                elif original_request_type == "insurance":
                    req = db.query(InsuranceRequest).filter(InsuranceRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "active_cover"
                elif original_request_type == "flight":
                    req = db.query(FlightRequest).filter(FlightRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "confirmed"
                elif original_request_type == "carhire":
                    req = db.query(CarHireRequest).filter(CarHireRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "confirmed"
                elif original_request_type == "airporttransfer":
                    req = db.query(AirportTransferRequest).filter(AirportTransferRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "confirmed"
                elif original_request_type == "visa":
                    req = db.query(VisaRequest).filter(VisaRequest.id == original_request_id).first()
                    if req:
                        req.payment_status = "paid"
                        req.request_status = "approved"  # or "completed" depending on your flow
                # If there are other types, add them here

                db.commit()

        db.commit()

    return {"status": "success"}