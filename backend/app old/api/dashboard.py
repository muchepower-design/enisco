from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, TravelRequest, InsuranceRequest, VisaRequest, Conversation, Invoice, Payment, VehicleBooking

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    base_stats = {
        "travel_requests": db.query(TravelRequest).filter(TravelRequest.user_id == current_user.id).count(),
        "insurance_requests": db.query(InsuranceRequest).filter(InsuranceRequest.user_id == current_user.id).count(),
    }
    
    if current_user.role in ["admin", "manager"]:
        total_paid = db.query(Payment).filter(Payment.payment_status == "paid").all()
        revenue = sum(p.amount for p in total_paid)
        base_stats.update({
            "total_users": db.query(User).count(),
            "total_travel_requests": db.query(TravelRequest).count(),
            "total_insurance_requests": db.query(InsuranceRequest).count(),
            "revenue": float(revenue),
            "pending_requests": db.query(TravelRequest).filter(TravelRequest.request_status == "request_received").count() +
                                db.query(InsuranceRequest).filter(InsuranceRequest.request_status == "quote_generated").count(),
            "awaiting_payment": db.query(TravelRequest).filter(TravelRequest.payment_status == "pending").count() +
                                db.query(InsuranceRequest).filter(InsuranceRequest.payment_status == "pending").count(),
        })
    
    if current_user.role in ["sales_officer", "finance_officer", "operations_manager"]:
        today = date.today()
        base_stats.update({
            "pending_requests": db.query(TravelRequest).filter(TravelRequest.request_status == "request_received").count(),
            "awaiting_payment": db.query(TravelRequest).filter(TravelRequest.payment_status == "pending").count(),
            "today_transfers": db.query(TravelRequest).filter(
                TravelRequest.service_type == "airport_transfer",
                TravelRequest.travel_date == today
            ).count(),
        })
    
    return base_stats


@router.get("/stats/sales")
def get_sales_stats(
    current_user: User = Depends(require_role(["sales_officer", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    pending_count = db.query(TravelRequest).filter(
        TravelRequest.request_status.in_(['request_received', 'quotation_sent'])
    ).count() + db.query(InsuranceRequest).filter(
        InsuranceRequest.request_status.in_(['quote_generated'])
    ).count() + db.query(VisaRequest).filter(
        VisaRequest.request_status.in_(['pending_review'])
    ).count()
    
    awaiting_payment = db.query(TravelRequest).filter(
        TravelRequest.payment_status == "pending"
    ).count() + db.query(InsuranceRequest).filter(
        InsuranceRequest.payment_status == "pending"
    ).count() + db.query(VisaRequest).filter(
        VisaRequest.payment_status == "pending"
    ).count()
    
    # active chats in last 24 hours
    yesterday = datetime.now() - timedelta(days=1)
    active_chats = db.query(Conversation).filter(
        Conversation.updated_at >= yesterday
    ).count()
    
    return {
        "pending_requests": pending_count,
        "awaiting_payment": awaiting_payment,
        "active_chats": active_chats
    }


@router.get("/stats/finance")
def get_finance_stats(
    current_user: User = Depends(require_role(["finance_officer", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    unpaid_invoices = db.query(Invoice).filter(
        Invoice.invoice_status.in_(['unpaid', 'part_paid'])
    ).count()
    
    overdue = db.query(Invoice).filter(
        Invoice.due_date < datetime.now(),
        Invoice.invoice_status != "paid"
    ).count()
    
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
    revenue_mtd = db.query(func.sum(Payment.amount)).filter(
        Payment.payment_status == "paid",
        Payment.created_at >= start_of_month
    ).scalar() or 0
    
    return {
        "awaiting_payment": unpaid_invoices,
        "overdue_invoices": overdue,
        "revenue_mtd": float(revenue_mtd)
    }


@router.get("/stats/operations")
def get_operations_stats(
    current_user: User = Depends(require_role(["operations_manager", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    today = date.today()
    today_transfers = db.query(TravelRequest).filter(
        TravelRequest.service_type == "airport_transfer",
        TravelRequest.travel_date == today,
        TravelRequest.request_status.in_(['confirmed_booking', 'awaiting_payment'])
    ).count()
    
    active_bookings = db.query(VehicleBooking).filter(
        VehicleBooking.status == "confirmed"
    ).count()
    
    # trips that are confirmed but have no vehicle assigned yet
    pending_assignments = db.query(TravelRequest).filter(
        TravelRequest.service_type.in_(['airport_transfer', 'vehicle_rental']),
        TravelRequest.request_status == "confirmed_booking",
        TravelRequest.id.notin_(
            db.query(VehicleBooking.travel_request_id).filter(
                VehicleBooking.travel_request_id.isnot(None)
            )
        )
    ).count()
    
    return {
        "today_transfers": today_transfers,
        "active_bookings": active_bookings,
        "pending_assignments": pending_assignments
    }