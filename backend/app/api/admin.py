from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..database import get_db
from ..auth import require_role
from ..models import User, VehicleInventory, TravelRequest, InsuranceRequest, VisaRequest, ServiceDocument
from ..schemas import VehicleCreate, VehicleResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ----- Vehicle endpoints -----

@router.get("/vehicles", response_model=List[VehicleResponse])
def get_vehicles(
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    return db.query(VehicleInventory).all()

@router.post("/vehicles", response_model=VehicleResponse)
def create_vehicle(
    vehicle: VehicleCreate,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    new_vehicle = VehicleInventory(**vehicle.dict())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: UUID,
    vehicle: VehicleCreate,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    db_vehicle = db.query(VehicleInventory).filter(VehicleInventory.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(404, "Vehicle not found")
    for key, value in vehicle.dict().items():
        setattr(db_vehicle, key, value)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: UUID,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    db_vehicle = db.query(VehicleInventory).filter(VehicleInventory.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(404, "Vehicle not found")
    db.delete(db_vehicle)
    db.commit()
    return {"message": "Deleted"}

# ----- Paid requests without documents -----

@router.get("/paid-requests")
def get_paid_requests(
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    # Get all paid requests from travel, insurance, visa
    paid_travel = db.query(TravelRequest).filter(TravelRequest.payment_status == "paid").all()
    paid_insurance = db.query(InsuranceRequest).filter(InsuranceRequest.payment_status == "paid").all()
    paid_visa = db.query(VisaRequest).filter(VisaRequest.payment_status == "paid").all()

    def has_document(request_type, request_id):
        return db.query(ServiceDocument).filter(
            ServiceDocument.request_type == request_type,
            ServiceDocument.request_id == request_id
        ).count() > 0

    result = []
    for req in paid_travel:
        if not has_document("travel", req.id):
            result.append({
                "id": str(req.id),
                "request_reference": req.request_reference,
                "request_type": "travel",
                "full_name": req.full_name,
                "phone": req.phone,
                "email": req.email,
                "amount": req.total_amount,
                "created_at": req.created_at
            })
    for req in paid_insurance:
        if not has_document("insurance", req.id):
            result.append({
                "id": str(req.id),
                "request_reference": req.request_reference,
                "request_type": "insurance",
                "buyer_name": req.buyer_name,
                "phone": req.phone,
                "email": req.email,
                "amount": req.total_amount,
                "created_at": req.created_at
            })
    for req in paid_visa:
        if not has_document("visa", req.id):
            result.append({
                "id": str(req.id),
                "request_reference": req.request_reference,
                "request_type": "visa",
                "applicant_name": req.applicant_name,
                "phone": req.phone,
                "email": req.email,
                "amount": req.total_amount,
                "created_at": req.created_at
            })
    return result