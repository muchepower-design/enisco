from fastapi import APIRouter, Request, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Payment, TravelRequest, InsuranceRequest, Invoice

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/stripe")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # In production, verify signature using Stripe library
    payload = await request.json()
    event_type = payload.get("type")
    
    if event_type == "payment_intent.succeeded":
        payment_intent = payload["data"]["object"]
        payment_reference = payment_intent.get("metadata", {}).get("payment_reference")
        
        # Update payment record
        payment = db.query(Payment).filter(Payment.payment_reference == payment_reference).first()
        if payment:
            payment.payment_status = "paid"
            payment.gateway_reference = payment_intent["id"]
            payment.webhook_data = payload
            db.commit()
            
            # Update related invoice and request
            invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
            if invoice:
                invoice.amount_paid += payment.amount
                invoice.balance = invoice.total_amount - invoice.amount_paid
                if invoice.balance <= 0:
                    invoice.invoice_status = "paid"
                else:
                    invoice.invoice_status = "part_paid"
                db.commit()
                
            # Update travel or insurance request payment status
            if payment.request_type == "travel":
                travel = db.query(TravelRequest).filter(TravelRequest.id == payment.request_id).first()
                if travel:
                    travel.payment_status = "paid"
                    travel.request_status = "confirmed_booking"
            else:
                insurance = db.query(InsuranceRequest).filter(InsuranceRequest.id == payment.request_id).first()
                if insurance:
                    insurance.payment_status = "paid"
                    insurance.request_status = "active_cover"
            db.commit()
    
    return {"status": "received"}