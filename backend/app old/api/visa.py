from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from datetime import datetime
import os
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, VisaRequest
from ..schemas import VisaRequestCreate, VisaRequestResponse
from ..crud.visa import create_visa_request
from ..utils.payments import calculate_service_fee

router = APIRouter(prefix="/api/visa", tags=["visa"])

def parse_date(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except:
        return None

@router.post("/request", response_model=VisaRequestResponse)
async def create_visa_request(
    data: str = Form(...),
    passport_photo: UploadFile = File(None),
    invitation_letter: UploadFile = File(None),
    proof_of_accommodation: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        payload = json.loads(data)
    except:
        raise HTTPException(400, "Invalid JSON")

    # Save files
    passport_photo_path = None
    invitation_letter_path = None
    proof_accommodation_path = None

    if passport_photo:
        os.makedirs("uploads/visa/passport_photos", exist_ok=True)
        ext = passport_photo.filename.split('.')[-1]
        passport_photo_path = f"uploads/visa/passport_photos/{uuid.uuid4()}.{ext}"
        with open(passport_photo_path, "wb") as f:
            f.write(await passport_photo.read())

    if invitation_letter:
        os.makedirs("uploads/visa/invitation_letters", exist_ok=True)
        ext = invitation_letter.filename.split('.')[-1]
        invitation_letter_path = f"uploads/visa/invitation_letters/{uuid.uuid4()}.{ext}"
        with open(invitation_letter_path, "wb") as f:
            f.write(await invitation_letter.read())

    if proof_of_accommodation:
        os.makedirs("uploads/visa/proof_accommodation", exist_ok=True)
        ext = proof_of_accommodation.filename.split('.')[-1]
        proof_accommodation_path = f"uploads/visa/proof_accommodation/{uuid.uuid4()}.{ext}"
        with open(proof_accommodation_path, "wb") as f:
            f.write(await proof_of_accommodation.read())

    base_fee = payload.get('base_fee', 0)
    service_fee_percent = 10.0
    service_fee = calculate_service_fee(base_fee, service_fee_percent)
    total_amount = base_fee + service_fee

    ref = f"VISA-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"

    visa_request = VisaRequest(
        user_id=current_user.id,
        request_reference=ref,
        applicant_name=payload['applicant_name'],
        date_of_birth=parse_date(payload.get('date_of_birth')),
        place_of_birth=payload.get('place_of_birth'),
        gender=payload['gender'],
        nationality=payload['nationality'],
        country_of_residence=payload['country_of_residence'],
        marital_status=payload.get('marital_status'),
        phone=payload['phone'],
        email=payload['email'],
        address=payload.get('address'),
        passport_number=payload['passport_number'],
        passport_issue_date=parse_date(payload.get('passport_issue_date')),
        passport_expiry_date=parse_date(payload.get('passport_expiry_date')),
        passport_issuing_authority=payload.get('passport_issuing_authority'),
        destination_country=payload['destination_country'],
        visa_type=payload['visa_type'],
        purpose_of_visit=payload.get('purpose_of_visit'),
        intended_arrival_date=parse_date(payload.get('intended_arrival_date')),
        intended_departure_date=parse_date(payload.get('intended_departure_date')),
        duration_of_stay_days=payload.get('duration_of_stay_days'),
        previous_visits_to_country=payload.get('previous_visits_to_country', False),
        previous_visit_details=payload.get('previous_visit_details'),
        occupation=payload.get('occupation'),
        employer_name=payload.get('employer_name'),
        employer_address=payload.get('employer_address'),
        employer_phone=payload.get('employer_phone'),
        monthly_income=payload.get('monthly_income'),
        education_level=payload.get('education_level'),
        accommodation_in_destination=payload.get('accommodation_in_destination'),
        contact_person_in_destination=payload.get('contact_person_in_destination'),
        contact_phone_in_destination=payload.get('contact_phone_in_destination'),
        health_insurance_policy=payload.get('health_insurance_policy'),
        criminal_record_disclosure=payload.get('criminal_record_disclosure'),
        special_requests=payload.get('special_requests'),
        base_fee=base_fee,
        service_fee=service_fee,
        total_amount=total_amount,
        passport_photo_file=passport_photo_path,
        invitation_letter_file=invitation_letter_path,
        proof_of_accommodation_file=proof_accommodation_path,
        notes=payload.get('notes'),
        request_status='pending_review'
    )
    db.add(visa_request)
    db.commit()
    db.refresh(visa_request)
    return visa_request

@router.get("/requests", response_model=List[VisaRequestResponse])
def get_my_visa_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(VisaRequest).filter(VisaRequest.user_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/admin/requests", response_model=List[VisaRequestResponse])
def get_all_visa_requests(
    current_user: User = Depends(require_role(["admin", "manager", "sales_officer"])),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(VisaRequest).offset(skip).limit(limit).all()

@router.get("/request/{request_id}", response_model=VisaRequestResponse)
def get_visa_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request ID")
    db_request = db.query(VisaRequest).filter(VisaRequest.id == uuid_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    if db_request.user_id != current_user.id and current_user.role not in ["admin", "manager", "sales_officer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return db_request