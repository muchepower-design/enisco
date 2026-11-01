from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, Payment, Invoice, TravelRequest, InsuranceRequest, Quotation, FlightRequest, CarHireRequest, AirportTransferRequest, VisaRequest
from ..schemas import PaymentInitiate, PaymentResponse, ProviderInfo, DepositInitiate, DepositResponse, DepositCheckResponse
from ..utils.payments import create_payment_intent, verify_payment
import uuid
import os
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])

# PawaPay configuration
PAWAPAY_API_KEY = os.environ.get('PAWAPAY_API_KEY', 'your-api-key-here')
PAWAPAY_BASE_URL = "https://api.pawapay.io/v2"

def get_pawapay_headers():
    return {
        "Authorization": f"Bearer {PAWAPAY_API_KEY}",
        "Content-Type": "application/json"
    }

# ---------- Existing endpoints ----------
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

    # Mock payment intent (kept for card payments)
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

        # Update related entity (same logic as before)
        _update_related_request(payment, db)

    return {"status": "success"}

# ---------- PawaPay Mobile Money Endpoints ----------

@router.get("/providers", response_model=List[ProviderInfo])
def get_providers():
    """
    Get available mobile money providers for Zambia from PawaPay.
    Returns a list of providers with deposit operational status.
    """
    try:
        resp = requests.get(
            f"{PAWAPAY_BASE_URL}/availability",
            headers=get_pawapay_headers(),
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            providers = []
            for country in data:
                if country.get('country') == 'ZMB':
                    for prov in country.get('providers', []):
                        deposit_status = prov.get('operationTypes', {}).get('DEPOSIT', 'CLOSED')
                        providers.append({
                            'provider': prov['provider'],
                            'name': prov['provider'].replace('_ZMB', '').replace('_OAPI_ZMB', '').replace('MOMO', ' Mobile Money'),
                            'country': 'ZMB',
                            'deposit_operational': deposit_status == 'OPERATIONAL'
                        })
            return providers
        else:
            logger.error(f"Failed to fetch providers: {resp.status_code} - {resp.text}")
            # Fallback to a static list if API fails (but still try to call real API first)
            return _fallback_providers()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching providers: {e}")
        return _fallback_providers()

def _fallback_providers():
    """Fallback provider list if PawaPay API is unreachable."""
    return [
        {"provider": "AIRTEL_OAPI_ZMB", "name": "Airtel Money", "country": "ZMB", "deposit_operational": True},
        {"provider": "MTN_MOMO_ZMB", "name": "MTN Mobile Money", "country": "ZMB", "deposit_operational": True},
        {"provider": "ZAMTEL_ZMB", "name": "Zamtel Money", "country": "ZMB", "deposit_operational": True},
    ]

@router.post("/deposit", response_model=DepositResponse)
def initiate_deposit(
    deposit_data: DepositInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate a mobile money deposit via PawaPay.
    Creates a payment record and sends deposit request to PawaPay.
    """
    # Generate deposit ID and client reference
    deposit_id = str(uuid.uuid4())
    client_ref = f"ENISCO-{deposit_data.request_id}-{uuid.uuid4().hex[:6].upper()}"

    # Clean the phone number: remove any non-digit characters (+, spaces, etc.)
    # and ensure it starts with country code (26 for Zambia) without the leading 0.
    raw_phone = deposit_data.phone_number
    # Remove all non-digit characters
    cleaned_phone = ''.join(filter(str.isdigit, raw_phone))
    # If the number starts with 0, replace it with 260 (Zambia country code)
    if cleaned_phone.startswith('0'):
        cleaned_phone = '260' + cleaned_phone[1:]
    # If it already starts with 260, keep as is
    elif cleaned_phone.startswith('260'):
        pass
    else:
        # Assume it's already a valid number without country code? But we'll still ensure it has 260.
        # For safety, we'll just use as is, but we can add more robust validation.
        pass

    # Sanitize customer message: only alphanumeric and spaces
    customer_msg = f"Enisco Order {deposit_data.request_id}"
    # Replace any non-alphanumeric (except space) with space, then collapse multiple spaces
    import re
    sanitized_msg = re.sub(r'[^a-zA-Z0-9 ]', ' ', customer_msg)
    sanitized_msg = re.sub(r'\s+', ' ', sanitized_msg).strip()
    # Truncate to 22 characters as per PawaPay limit
    sanitized_msg = sanitized_msg[:22]

    # Build the PawaPay payload
    payload = {
        "depositId": deposit_id,
        "payer": {
            "type": "MMO",
            "accountDetails": {
                "phoneNumber": cleaned_phone,  # e.g., 260975123456
                "provider": deposit_data.provider
            }
        },
        "amount": str(deposit_data.amount),
        "currency": "ZMW",
        "clientReferenceId": client_ref,
        "customerMessage": sanitized_msg,
        "metadata": [
            {"requestId": str(deposit_data.request_id)},
            {"customerId": current_user.email, "isPII": True}
        ]
    }

    try:
        resp = requests.post(
            f"{PAWAPAY_BASE_URL}/deposits",
            json=payload,
            headers=get_pawapay_headers(),
            timeout=30
        )
        pawa_resp = resp.json()

        if resp.status_code == 200:
            status = pawa_resp.get('status')
            if status in ['ACCEPTED', 'DUPLICATE_IGNORED']:
                # Create a payment record with the deposit_id
                payment_ref = f"PAY-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
                payment = Payment(
                    payment_reference=payment_ref,
                    request_type=deposit_data.request_type,
                    request_id=deposit_data.request_id,
                    user_id=current_user.id,
                    customer_name=current_user.full_name or "Customer",
                    customer_phone=deposit_data.phone_number,  # store original for reference
                    amount=deposit_data.amount,
                    payment_method=deposit_data.provider,
                    payment_status="pending",
                    deposit_id=deposit_id,
                    invoice_id=None
                )
                db.add(payment)
                db.commit()
                db.refresh(payment)

                return DepositResponse(
                    success=True,
                    deposit_id=deposit_id,
                    message="Payment request sent. Please check your phone to approve.",
                    status=status
                )
            else:
                # Immediate rejection
                return DepositResponse(
                    success=False,
                    status=status,
                    failure_reason=pawa_resp.get('failureReason', {}).get('failureMessage', 'Payment rejected by provider')
                )
        else:
            # HTTP error
            logger.error(f"PawaPay deposit error: {resp.status_code} - {resp.text}")
            return DepositResponse(
                success=False,
                status='ERROR',
                failure_reason=pawa_resp.get('failureReason', {}).get('failureMessage', f"Payment service error (HTTP {resp.status_code})")
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"PawaPay deposit request exception: {e}")
        return DepositResponse(
            success=False,
            status='ERROR',
            failure_reason="Payment service temporarily unavailable"
        )
        
@router.get("/deposit/{deposit_id}/check", response_model=DepositCheckResponse)
def check_deposit_status(
    deposit_id: str,
    db: Session = Depends(get_db)
):
    """
    Poll PawaPay for the deposit status.
    If COMPLETED, mark payment as paid and update the related request.
    """
    # Find the payment by deposit_id
    payment = db.query(Payment).filter(Payment.deposit_id == deposit_id).first()
    if not payment:
        return DepositCheckResponse(
            success=False,
            status="NOT_FOUND",
            message="Deposit record not found"
        )

    try:
        resp = requests.get(
            f"{PAWAPAY_BASE_URL}/deposits/{deposit_id}",
            headers=get_pawapay_headers(),
            timeout=10
        )
        data = resp.json()

        if resp.status_code == 200:
            status = data.get('status')
            deposit_data = data.get('data') if status == 'FOUND' else None

            if status == 'FOUND' and deposit_data:
                deposit_status = deposit_data.get('status')

                if deposit_status == 'COMPLETED':
                    # Mark payment as paid
                    payment.payment_status = "paid"
                    payment.gateway_reference = deposit_id
                    db.commit()

                    # Update the related request
                    _update_related_request(payment, db)

                    return DepositCheckResponse(
                        success=True,
                        status="COMPLETED",
                        message="Payment completed successfully"
                    )

                elif deposit_status == 'FAILED':
                    payment.payment_status = "failed"
                    db.commit()
                    return DepositCheckResponse(
                        success=False,
                        status="FAILED",
                        failure_reason=deposit_data.get('failureReason', {}).get('failureMessage', 'Payment failed')
                    )

                elif deposit_status in ['ACCEPTED', 'PROCESSING', 'IN_RECONCILIATION']:
                    return DepositCheckResponse(
                        success=True,
                        status=deposit_status,
                        message="Payment still processing"
                    )

                else:
                    return DepositCheckResponse(success=False, status="UNKNOWN")

            elif status == 'NOT_FOUND':
                payment.payment_status = "failed"
                db.commit()
                return DepositCheckResponse(success=False, status="NOT_FOUND", message="Deposit not found")

            else:
                return DepositCheckResponse(success=False, status="UNKNOWN")

        else:
            logger.error(f"PawaPay status check error: {resp.status_code} - {resp.text}")
            return DepositCheckResponse(
                success=False,
                status="ERROR",
                failure_reason="Payment service error"
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"PawaPay status check exception: {e}")
        return DepositCheckResponse(
            success=False,
            status="ERROR",
            failure_reason="Payment service temporarily unavailable"
        )

def _update_related_request(payment: Payment, db: Session):
    """Update the original request status based on payment."""
    if payment.request_type == "travel":
        req = db.query(TravelRequest).filter(TravelRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "confirmed_booking"
    elif payment.request_type == "insurance":
        req = db.query(InsuranceRequest).filter(InsuranceRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "active_cover"
    elif payment.request_type == "quotation":
        quote = db.query(Quotation).filter(Quotation.id == payment.request_id).first()
        if quote:
            quote.payment_status = "paid"
            quote.status = "accepted"
            db.commit()
            # Update original request from quotation
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
                    req.request_status = "approved"
    elif payment.request_type == "flight":
        req = db.query(FlightRequest).filter(FlightRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "confirmed"
    elif payment.request_type == "carhire":
        req = db.query(CarHireRequest).filter(CarHireRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "confirmed"
    elif payment.request_type == "airporttransfer":
        req = db.query(AirportTransferRequest).filter(AirportTransferRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "confirmed"
    elif payment.request_type == "visa":
        req = db.query(VisaRequest).filter(VisaRequest.id == payment.request_id).first()
        if req:
            req.payment_status = "paid"
            req.request_status = "approved"
    db.commit()