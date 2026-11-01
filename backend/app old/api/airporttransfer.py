from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from datetime import datetime
import os
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, AirportTransferRequest
from ..schemas import AirportTransferRequestCreate, AirportTransferRequestResponse
from ..utils.payments import calculate_service_fee

router = APIRouter(prefix="/api/airporttransfer", tags=["airporttransfer"])

def parse_datetime(dt_str):
    """Parse ISO datetime string, return None if empty or invalid."""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except:
        return None

def parse_int(value):
    """Convert empty string or None to None, otherwise return int."""
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

@router.post("/request", response_model=AirportTransferRequestResponse)
async def create_airporttransfer_request(
    data: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        payload = json.loads(data)
    except:
        raise HTTPException(400, "Invalid JSON")

    base_amount = payload.get('base_amount', 0)
    service_fee_percent = 10.0
    service_fee = calculate_service_fee(base_amount, service_fee_percent)
    total_amount = base_amount + service_fee

    ref = f"ATP-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"

    transfer = AirportTransferRequest(
        user_id=current_user.id,
        request_reference=ref,
        full_name=payload['full_name'],
        phone=payload['phone'],
        email=payload['email'],
        flight_number=payload['flight_number'],
        airline=payload.get('airline'),
        arrival_time=parse_datetime(payload.get('arrival_time')),
        departure_time=parse_datetime(payload.get('departure_time')),
        transfer_type=payload['transfer_type'],
        pickup_location=payload['pickup_location'],
        dropoff_location=payload['dropoff_location'],
        pickup_date=parse_datetime(payload.get('pickup_date')),
        pickup_time=payload.get('pickup_time'),
        passengers=parse_int(payload.get('passengers')) or 1,
        luggage_count=parse_int(payload.get('luggage_count')) or 0,
        vehicle_type=payload.get('vehicle_type'),
        special_requests=payload.get('special_requests'),
        base_amount=base_amount,
        service_fee=service_fee,
        total_amount=total_amount,
        notes=payload.get('notes'),
        request_status='pending_quote'
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    return transfer

@router.get("/requests", response_model=List[AirportTransferRequestResponse])
def get_my_airporttransfer_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AirportTransferRequest).filter(AirportTransferRequest.user_id == current_user.id).all()

@router.get("/admin/requests", response_model=List[AirportTransferRequestResponse])
def get_all_airporttransfer_requests(
    current_user: User = Depends(require_role(["admin","manager","sales_officer"])),
    db: Session = Depends(get_db)
):
    return db.query(AirportTransferRequest).all()

@router.get("/request/{request_id}", response_model=AirportTransferRequestResponse)
def get_airporttransfer_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(request_id)
    except:
        raise HTTPException(400, "Invalid ID")
    req = db.query(AirportTransferRequest).filter(AirportTransferRequest.id == uuid_id).first()
    if not req:
        raise HTTPException(404, "Not found")
    if req.user_id != current_user.id and current_user.role not in ["admin","manager","sales_officer"]:
        raise HTTPException(403, "Not authorized")
    return req