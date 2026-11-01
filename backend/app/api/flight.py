from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
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
from dateutil import parser

import logging
logging.basicConfig(filename='/home/kanchinn/pythonenisco/flight_debug.log', level=logging.DEBUG)

router = APIRouter(prefix="/api/flight", tags=["flight"])

def parse_datetime(dt_str):
    """Parse ISO datetime string, return None if empty or invalid."""
    if not dt_str:
        return None
    try:
        return parser.isoparse(dt_str)
    except:
        return None

@router.post("/request", response_model=FlightRequestResponse)
async def create_flight_request(
    data: str = Form(...),
    passport: UploadFile = File(None),
    visa: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logging.debug(f"Received data: {data}")
    try:
        payload = json.loads(data)
        logging.debug(f"Parsed payload: {payload}")
    except Exception as e:
        logging.error(f"JSON parse error: {e}")
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

    # Validate flight_type and required fields
    flight_type = payload.get('flight_type', 'international')
    if flight_type == 'international':
        required_fields = ['passport_number', 'passport_expiry', 'nationality', 'date_of_birth', 'gender']
        for field in required_fields:
            if not payload.get(field):
                raise HTTPException(400, f"{field} is required for international flights")

    # Validate trip_type and segments
    trip_type = payload.get('trip_type', 'one_way')
    if trip_type == 'multi_city':
        segments = payload.get('segments')
        if not segments or not isinstance(segments, list) or len(segments) < 2:
            raise HTTPException(400, "For multi-city, provide at least two segments in 'segments' list")
        for seg in segments:
            if not all(k in seg for k in ('origin', 'destination', 'travel_date')):
                raise HTTPException(400, "Each segment must have origin, destination, and travel_date")
    else:
        segments = None

    # Calculate fees
    base_amount = payload.get('base_amount', 0)
    service_fee_percent = 10.0
    service_fee = calculate_service_fee(base_amount, service_fee_percent)
    total_amount = base_amount + service_fee

    # Handle airline_id – convert empty string to None
    airline_id = payload.get('airline_id')
    if airline_id is None or str(airline_id).strip() == "":
        airline_id = None
    else:
        # Verify the airline exists
        airline = db.query(Airline).filter(Airline.id == airline_id).first()
        if not airline:
            raise HTTPException(400, f"Invalid airline ID: {airline_id}")

    # Build request object
    request_ref = f"FLT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"
    flight_request = FlightRequest(
        user_id=current_user.id,
        request_reference=request_ref,
        full_name=payload['full_name'],
        passport_number=payload.get('passport_number'),
        passport_expiry=parse_datetime(payload.get('passport_expiry')),
        nationality=payload.get('nationality'),
        date_of_birth=parse_datetime(payload.get('date_of_birth')),
        gender=payload.get('gender'),
        phone=payload['phone'],
        email=payload['email'],
        address=payload.get('address'),
        airline_id=airline_id,  # now either UUID or None
        trip_type=trip_type,
        flight_type=flight_type,
        segments=segments,  # JSON list – SQLAlchemy will serialize
        origin=payload['origin'],
        destination=payload['destination'],
        travel_date=parse_datetime(payload.get('travel_date')),
        return_date=parse_datetime(payload.get('return_date')) if trip_type == 'round_trip' else None,
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
    try:
        db.add(flight_request)
        db.commit()
        db.refresh(flight_request)
    except IntegrityError as e:
        logging.error(f"Database integrity error: {e}")
        db.rollback()
        raise HTTPException(400, f"Database error: {e.orig}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        db.rollback()
        raise HTTPException(500, f"Internal server error: {str(e)}")

    return flight_request

# GET endpoints remain unchanged...
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