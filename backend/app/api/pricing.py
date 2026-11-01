from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud.pricing import get_flight_price, get_insurance_premium
from ..schemas import FlightPriceRequest, InsurancePriceRequest, PriceResponse
from ..models import InsuranceCompany, VehicleInventory, Airline

router = APIRouter(prefix="/api/pricing", tags=["pricing"])

@router.post("/flight", response_model=PriceResponse)
def check_flight_price(req: FlightPriceRequest, db: Session = Depends(get_db)):
    price = get_flight_price(db, req.airline_id, req.origin, req.destination, req.travel_class)
    if price is None:
        return PriceResponse(price_available=False, message="Price not available. Request a quotation.")
    return PriceResponse(price_available=True, amount=price)

@router.post("/insurance", response_model=PriceResponse)
def check_insurance_price(req: InsurancePriceRequest, db: Session = Depends(get_db)):
    premium = get_insurance_premium(db, req.company_id, req.vehicle_type, req.insurance_type, req.quarters)
    if premium is None:
        return PriceResponse(price_available=False, message="Premium not available. Request a quotation.")
    return PriceResponse(price_available=True, amount=premium)

@router.get("/insurance-companies")
def get_insurance_companies(db: Session = Depends(get_db)):
    companies = db.query(InsuranceCompany).all()
    return [{"id": str(c.id), "name": c.name} for c in companies]

@router.get("/vehicle-types")
def get_vehicle_types(db: Session = Depends(get_db)):
    types = db.query(VehicleInventory.type).distinct().filter(VehicleInventory.type.isnot(None)).all()
    return [t[0] for t in types]

@router.get("/airlines")
def get_airlines(db: Session = Depends(get_db)):
    airlines = db.query(Airline).all()
    return [{"id": str(a.id), "name": a.name, "code": a.code} for a in airlines]