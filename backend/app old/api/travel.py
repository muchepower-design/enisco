from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, TravelRequest
from ..schemas import TravelRequestCreate, TravelRequestResponse, TravelRequestUpdate
from ..crud.travel import create_travel_request, update_travel_request_status
from ..utils.payments import calculate_service_fee
import uuid
from datetime import datetime
from uuid import UUID  # add this at the top with other imports

router = APIRouter(prefix="/api/travel", tags=["travel"])

@router.post("/request", response_model=TravelRequestResponse)
def create_travel_request_endpoint(
    request: TravelRequestCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    travel_date = None
    if request.travel_date:
        try:
            travel_date = datetime.fromisoformat(request.travel_date.replace('Z', '+00:00'))
        except:
            pass

    # Calculate service fee for flight ticketing
    service_fee_percent = 10.0 if request.service_type == "flight_ticketing" else 0
    base_amount = request.base_amount or 0
    service_fee = calculate_service_fee(base_amount, service_fee_percent) if service_fee_percent > 0 else 0
    total_amount = base_amount + service_fee

    
    print("Received request data:", request.dict())
    travel_request = create_travel_request(
        db=db,
        user_id=current_user.id,
        request_reference=f"ENI-TRV-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:3]}",
        action_type=request.action_type,
        service_type=request.service_type,
        full_name=request.full_name,
        phone=request.phone,
        email=request.email,
        pickup_location=request.pickup_location,
        destination=request.destination,
        travel_date=travel_date,
        passengers=request.passengers,
        preferred_vehicle=request.preferred_vehicle,
        base_amount=base_amount,
        service_fee=service_fee,
        total_amount=total_amount,
        notes=request.notes
    )
    
    # Background task: send notification, generate quote if needed
    return travel_request

@router.get("/requests", response_model=List[TravelRequestResponse])
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    requests = db.query(TravelRequest).filter(TravelRequest.user_id == current_user.id).offset(skip).limit(limit).all()
    return requests

@router.get("/admin/requests", response_model=List[TravelRequestResponse])
def get_all_requests(
    current_user: User = Depends(require_role(["admin", "manager", "operations_manager"])),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(TravelRequest).offset(skip).limit(limit).all()

@router.put("/request/{request_id}/status")
def update_request_status(
    request_id: str,
    update_data: TravelRequestUpdate,
    current_user: User = Depends(require_role(["admin", "manager", "sales_officer"])),
    db: Session = Depends(get_db)
):
    return update_travel_request_status(db, request_id, update_data.request_status)


@router.get("/request/{request_id}", response_model=TravelRequestResponse)
def get_travel_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    db_request = db.query(TravelRequest).filter(TravelRequest.id == uuid_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Allow if user owns request or is admin/manager/staff
    if db_request.user_id != current_user.id and current_user.role not in ["admin", "manager", "sales_officer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db_request


@router.get("/requests/{service_type}")
def get_requests_by_type(
    service_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # service_type: 'flight_ticketing', 'vehicle_rental', 'airport_transfer'
    return db.query(TravelRequest).filter(
        TravelRequest.user_id == current_user.id,
        TravelRequest.service_type == service_type
    ).all()

@router.get("/admin/requests/{service_type}")
def get_all_requests_by_type(
    service_type: str,
    current_user: User = Depends(require_role(["admin", "manager", "sales_officer"])),
    db: Session = Depends(get_db)
):
    return db.query(TravelRequest).filter(
        TravelRequest.service_type == service_type
    ).all()