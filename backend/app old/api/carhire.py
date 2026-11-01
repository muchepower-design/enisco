from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from datetime import datetime
import os
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, CarHireRequest
from ..schemas import CarHireRequestCreate, CarHireRequestResponse
from ..utils.payments import calculate_service_fee

router = APIRouter(prefix="/api/carhire", tags=["carhire"])
def parse_int(value):
    """Convert empty string or None to None, otherwise return int."""
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None
    
def parse_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except:
        return None

@router.post("/request", response_model=CarHireRequestResponse)
async def create_carhire_request(
    data: str = Form(...),
    license_file: UploadFile = File(None),
    id_document_file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        payload = json.loads(data)
        print("Here Is mY Payload = ", payload)
    except:
        raise HTTPException(400, "Invalid JSON")

    # Save files
    license_path = None
    id_document_path = None
    if license_file:
        os.makedirs("uploads/carhire/licenses", exist_ok=True)
        ext = license_file.filename.split('.')[-1]
        license_path = f"uploads/carhire/licenses/{uuid.uuid4()}.{ext}"
        with open(license_path, "wb") as f:
            f.write(await license_file.read())
    if id_document_file:
        os.makedirs("uploads/carhire/nrcs", exist_ok=True)
        ext = id_document_file.filename.split('.')[-1]
        id_document_path = f"uploads/carhire/nrcs/{uuid.uuid4()}.{ext}"
        with open(id_document_path, "wb") as f:
            f.write(await id_document_file.read())

    base_amount = payload.get('base_amount', 0)
    service_fee_percent = 10.0
    service_fee = calculate_service_fee(base_amount, service_fee_percent)
    total_amount = base_amount + service_fee

    ref = f"CAR-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"

    carhire = CarHireRequest(
        user_id=current_user.id,
        request_reference=ref,
        full_name=payload['full_name'],
        phone=payload['phone'],
        email=payload['email'],
        id_type=payload['id_type'],
        id_number=payload['id_number'],
        driver_license_number=payload['driver_license_number'],
        driver_license_expiry=parse_datetime(payload.get('driver_license_expiry')),
        nationality=payload.get('nationality'),
        date_of_birth=parse_datetime(payload.get('date_of_birth')),
        pickup_location=payload['pickup_location'],
        dropoff_location=payload.get('dropoff_location'),
        pickup_date=parse_datetime(payload.get('pickup_date')),
        pickup_time=payload.get('pickup_time'),
        dropoff_date=parse_datetime(payload.get('dropoff_date')),
        dropoff_time=payload.get('dropoff_time'),
        rental_duration_days=parse_int(payload.get('rental_duration_days')),
        vehicle_type=payload.get('vehicle_type'),
        preferred_model=payload.get('preferred_model'),
        transmission=payload.get('transmission'),
        fuel_policy=payload.get('fuel_policy'),
        additional_drivers=parse_int(payload.get('additional_drivers')) or 0,
        child_seat=payload.get('child_seat', False),
        gps_navigation=payload.get('gps_navigation', False),
        base_amount=base_amount,
        service_fee=service_fee,
        total_amount=total_amount,
        driver_license_file=license_path,
        id_document_file=id_document_path,
        notes=payload.get('notes'),
        request_status='pending_quote'
    )
    
    
    
    db.add(carhire)
    db.commit()
    db.refresh(carhire)
    return carhire

@router.get("/requests", response_model=List[CarHireRequestResponse])
def get_my_carhire_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CarHireRequest).filter(CarHireRequest.user_id == current_user.id).all()

@router.get("/admin/requests", response_model=List[CarHireRequestResponse])
def get_all_carhire_requests(
    current_user: User = Depends(require_role(["admin","manager","sales_officer"])),
    db: Session = Depends(get_db)
):
    return db.query(CarHireRequest).all()

@router.get("/request/{request_id}", response_model=CarHireRequestResponse)
def get_carhire_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(request_id)
    except:
        raise HTTPException(400, "Invalid ID")
    req = db.query(CarHireRequest).filter(CarHireRequest.id == uuid_id).first()
    if not req:
        raise HTTPException(404, "Not found")
    if req.user_id != current_user.id and current_user.role not in ["admin","manager","sales_officer"]:
        raise HTTPException(403, "Not authorized")
    return req