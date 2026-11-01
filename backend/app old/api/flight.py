from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
import os
import json
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, FlightRequest, Airline
from ..schemas import FlightRequestCreate, FlightRequestResponse
from ..crud.flight import create_flight_request
from ..utils.payments import calculate_service_fee

router = APIRouter(prefix="/api/flight", tags=["flight"])

def parse_datetime(dt_str):
    """Parse ISO datetime string, return None if empty or invalid."""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except:
        return None

@router.post("/request", response_model=FlightRequestResponse)
async def create_flight_request(
    data: str = Form(...),  # JSON string
    passport: UploadFile = File(None),
    visa: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        payload = json.loads(data)
    except:
        raise HTTPException(400, "Invalid JSON data")

    # Save files
    passport_path = None
    visa_path = None
    if passport:
        os.makedirs("uploads/flight/passports", exist_ok=True)
        ext = passport.filename.split('.')[-1]
        passport_path = f"uploads/flight/passports/{uuid.uuid4()}.{ext}"
        with open(passport_path, "wb") as f:
            f.write(await passport.read())
    if visa:
        os.makedirs("uploads/flight/visas", exist_ok=True)
        ext = visa.filename.split('.')[-1]
        visa_path = f"uploads/flight/visas/{uuid.uuid4()}.{ext}"
        with open(visa_path, "wb") as f:
            f.write(await visa.read())

    # Calculate fees
    base_amount = payload.get('base_amount', 0)
    service_fee_percent = 10.0  # fixed for flights
    service_fee = calculate_service_fee(base_amount, service_fee_percent)
    total_amount = base_amount + service_fee

    # Build request object
    request_ref = f"FLT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"
    flight_request = FlightRequest(
        user_id=current_user.id,
        request_reference=request_ref,
        full_name=payload['full_name'],
        passport_number=payload['passport_number'],
        passport_expiry=parse_datetime(payload.get('passport_expiry')),
        nationality=payload['nationality'],
        date_of_birth=parse_datetime(payload.get('date_of_birth')),
        gender=payload['gender'],
        phone=payload['phone'],
        email=payload['email'],
        address=payload.get('address'),
        # Handle airline_id: if empty string, set to None
        airline_id=payload.get('airline_id') if payload.get('airline_id') else None,
        origin=payload['origin'],
        destination=payload['destination'],
        travel_date=parse_datetime(payload.get('travel_date')),
        return_date=parse_datetime(payload.get('return_date')),
        travel_class=payload['travel_class'],
        passengers=payload['passengers'],
        meal_preference=payload.get('meal_preference'),
        seat_preference=payload.get('seat_preference'),
        special_assistance=payload.get('special_assistance'),
        base_amount=base_amount,
        service_fee=service_fee,
        total_amount=total_amount,
        passport_file=passport_path,
        visa_file=visa_path,
        notes=payload.get('notes'),
        request_status='pending_quote'
    )
    db.add(flight_request)
    db.commit()
    db.refresh(flight_request)
    return flight_request

@router.get("/requests", response_model=List[FlightRequestResponse])
def get_my_flight_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FlightRequest).filter(FlightRequest.user_id == current_user.id).all()

@router.get("/admin/requests", response_model=List[FlightRequestResponse])
def get_all_flight_requests(current_user: User = Depends(require_role(["admin","manager","sales_officer"])), db: Session = Depends(get_db)):
    return db.query(FlightRequest).all()

@router.get("/request/{request_id}", response_model=FlightRequestResponse)
def get_flight_request(request_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        uuid_id = uuid.UUID(request_id)
    except:
        raise HTTPException(400, "Invalid ID")
    req = db.query(FlightRequest).filter(FlightRequest.id == uuid_id).first()
    if not req:
        raise HTTPException(404, "Not found")
    if req.user_id != current_user.id and current_user.role not in ["admin","manager","sales_officer"]:
        raise HTTPException(403, "Not authorized")
    return req