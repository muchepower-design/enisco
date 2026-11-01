from fastapi import APIRouter, Depends
from datetime import date
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import require_role
from ..models import User, TravelRequest

router = APIRouter(prefix="/api/operations", tags=["operations"])

@router.get("/today-tasks")
def get_today_tasks(current_user: User = Depends(require_role(["operations_manager", "admin", "manager"])), db: Session = Depends(get_db)):
    today = date.today()
    tasks = db.query(TravelRequest).filter(
        TravelRequest.service_type == "airport_transfer",
        TravelRequest.travel_date == today,
        TravelRequest.request_status.in_(['confirmed_booking', 'awaiting_payment'])
    ).all()
    return tasks