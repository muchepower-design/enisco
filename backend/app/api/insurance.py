from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import json
import os
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, InsuranceRequest, InsuranceCompany
from ..schemas import InsuranceRequestCreate, InsuranceRequestResponse
from ..crud.insurance import create_insurance_request
from ..utils.payments import calculate_service_fee
from uuid import UUID

router = APIRouter(prefix="/api/insurance", tags=["insurance"])

def parse_date(date_str: str) -> datetime:
    """Convert YYYY-MM-DD string to datetime."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid start_date format: {date_str}. Use YYYY-MM-DD.")

@router.post("/request", response_model=InsuranceRequestResponse)
async def create_insurance_request_endpoint(
    data: str = Form(...),  # JSON string of the payload
    white_book: UploadFile = File(None),
    road_tax_disc: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        payload = json.loads(data)
    except:
        raise HTTPException(400, "Invalid JSON")

    # Convert empty strings to None for all possible fields
    for key in [
        'email', 'address', 'nrc_passport', 'other_insurance_type', 'vehicle_type',
        'vehicle_make_model', 'number_plate', 'chasis_number', 'engine_number',
        'vehicle_color', 'motorcycle_type', 'property_address', 'property_type',
        'property_size', 'occupation', 'employer', 'existing_conditions',
        'destination_country', 'purpose_of_travel', 'notes',
        'white_book_name', 'business_name', 'business_type', 'premises_address',
        'public_liability_notes'
    ]:
        if payload.get(key) == "":
            payload[key] = None

    # File uploads
    white_book_path = None
    road_tax_disc_path = None

    insurance_type = payload.get('insurance_type')
    is_motor = insurance_type in ['motor_vehicle', 'motorcycle']

    if white_book:
        os.makedirs("uploads/insurance/white_books", exist_ok=True)
        ext = white_book.filename.split('.')[-1]
        white_book_path = f"uploads/insurance/white_books/{uuid.uuid4()}.{ext}"
        with open(white_book_path, "wb") as f:
            f.write(await white_book.read())
    if road_tax_disc:
        os.makedirs("uploads/insurance/road_tax_discs", exist_ok=True)
        ext = road_tax_disc.filename.split('.')[-1]
        road_tax_disc_path = f"uploads/insurance/road_tax_discs/{uuid.uuid4()}.{ext}"
        with open(road_tax_disc_path, "wb") as f:
            f.write(await road_tax_disc.read())

    # For motor types, at least one document must be uploaded
    if is_motor and not white_book_path and not road_tax_disc_path:
        raise HTTPException(400, "At least one of White Book or Road Tax Disc is required for motor insurance.")

    # Parse start date
    start_date = parse_date(payload.get('start_date'))

    # Premium calculation
    base_premium = 0 #payload.get('base_premium', 0)
    if base_premium == 0:
        base_premium = Decimal('0.0')
    else:
        base_premium = Decimal(str(base_premium))

    service_fee_percent = Decimal('0.0')
    service_fee = 0 #(base_premium * service_fee_percent) / Decimal('100')
    total_amount = base_premium + service_fee

    # Quarters and cover days (only meaningful for motor, but we keep it for all)
    quarter_days = 90
    quarters = payload.get('quarters', 1)
    cover_days = quarters * quarter_days
    expiry_date = start_date + timedelta(days=cover_days) if start_date else None

    # Prepare the call to create_insurance_request with all fields
    insurance_request = create_insurance_request(
        db=db,
        user_id=current_user.id,
        request_reference=f"ENI-INS-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:3]}",
        buyer_name=payload['buyer_name'],
        phone=payload['phone'],
        email=payload.get('email'),
        address=payload.get('address'),
        nrc_passport=payload.get('nrc_passport'),
        # date_of_birth removed – not sent anymore
        insurance_type=insurance_type,
        other_insurance_type=payload.get('other_insurance_type'),
        vehicle_type=payload.get('vehicle_type'),
        vehicle_make_model=payload.get('vehicle_make_model'),
        number_plate=payload.get('number_plate'),
        chasis_number=payload.get('chasis_number'),
        engine_number=payload.get('engine_number'),
        vehicle_color=payload.get('vehicle_color'),
        vehicle_value=Decimal(str(payload.get('vehicle_value', 0))),
        year_of_manufacture=payload.get('year_of_manufacture'),
        motorcycle_type=payload.get('motorcycle_type'),
        white_book_name=payload.get('white_book_name'),  # new field
        property_address=payload.get('property_address'),
        property_type=payload.get('property_type'),
        property_value=Decimal(str(payload.get('property_value', 0))),
        property_size=payload.get('property_size'),
        occupation=payload.get('occupation'),
        employer=payload.get('employer'),
        monthly_income=Decimal(str(payload.get('monthly_income', 0))),
        existing_conditions=payload.get('existing_conditions'),
        smoker=payload.get('smoker', False),
        alcohol_consumption=payload.get('alcohol_consumption', False),
        destination_country=payload.get('destination_country'),
        travel_start_date=parse_date(payload.get('travel_start_date')),
        travel_end_date=parse_date(payload.get('travel_end_date')),
        purpose_of_travel=payload.get('purpose_of_travel'),
        # Public Liability fields
        business_name=payload.get('business_name'),
        business_type=payload.get('business_type'),
        premises_address=payload.get('premises_address'),
        estimated_turnover=Decimal(str(payload.get('estimated_turnover', 0))),
        coverage_amount=Decimal(str(payload.get('coverage_amount', 0))),
        public_liability_notes=payload.get('public_liability_notes'),
        # Policy
        insurance_company_id=payload.get('insurance_company_id'),
        start_date=start_date,
        quarters=quarters,
        cover_days=cover_days,
        expiry_date=expiry_date,
        base_premium=base_premium,
        service_fee=service_fee,
        total_amount=total_amount,
        notes=payload.get('notes'),
        white_book_file=white_book_path,
        road_tax_disc_file=road_tax_disc_path
    )
    return insurance_request

# The rest of the endpoints remain unchanged ...
@router.get("/requests", response_model=List[InsuranceRequestResponse])
def get_my_insurance_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    requests = db.query(InsuranceRequest).options(joinedload(InsuranceRequest.insurance_company))\
        .filter(InsuranceRequest.user_id == current_user.id)\
        .offset(skip).limit(limit).all()
    
    result = []
    for req in requests:
        data = req.__dict__.copy()
        data.pop('_sa_instance_state', None)
        data["insurance_company_name"] = req.insurance_company.name if req.insurance_company else None
        result.append(data)
    return result

@router.get("/admin/requests", response_model=List[InsuranceRequestResponse])
def get_all_insurance_requests(
    current_user: User = Depends(require_role(["admin", "manager", "sales_officer"])),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    requests = db.query(InsuranceRequest).options(joinedload(InsuranceRequest.insurance_company))\
        .offset(skip).limit(limit).all()
    
    result = []
    for req in requests:
        data = req.__dict__.copy()
        data.pop('_sa_instance_state', None)
        data["insurance_company_name"] = req.insurance_company.name if req.insurance_company else None
        result.append(data)
    return result

@router.get("/request/{request_id}", response_model=InsuranceRequestResponse)
def get_insurance_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    
    db_request = db.query(InsuranceRequest).options(joinedload(InsuranceRequest.insurance_company))\
        .filter(InsuranceRequest.id == uuid_id).first()
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if db_request.user_id != current_user.id and current_user.role not in ["admin", "manager", "sales_officer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data = db_request.__dict__.copy()
    data.pop('_sa_instance_state', None)
    data["insurance_company_name"] = db_request.insurance_company.name if db_request.insurance_company else None
    return data