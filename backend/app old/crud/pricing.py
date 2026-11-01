from sqlalchemy.orm import Session
from decimal import Decimal
from uuid import UUID
from ..models import FlightRoute, InsurancePremium

def get_flight_price(db: Session, airline_id: UUID, origin: str, destination: str, travel_class: str) -> Decimal:
    route = db.query(FlightRoute).filter(
        FlightRoute.airline_id == airline_id,
        FlightRoute.origin == origin,
        FlightRoute.destination == destination,
        FlightRoute.travel_class == travel_class
    ).first()
    return route.base_price if route else None

def get_insurance_premium(db: Session, company_id: UUID, vehicle_type: str, insurance_type: str, quarters: int) -> Decimal:
    premium = db.query(InsurancePremium).filter(
        InsurancePremium.company_id == company_id,
        InsurancePremium.vehicle_type == vehicle_type,
        InsurancePremium.insurance_type == insurance_type
    ).first()
    if premium:
        return premium.base_premium_per_quarter * quarters
    return None