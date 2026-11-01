from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
from ..models import VehicleInventory, VehicleBooking

def get_available_vehicles(db: Session, start_date: datetime, end_date: datetime, vehicle_type: str = None):
    query = db.query(VehicleInventory).filter(VehicleInventory.is_available == True)
    if vehicle_type:
        query = query.filter(VehicleInventory.type == vehicle_type)
    booked = db.query(VehicleBooking.vehicle_id).filter(
        VehicleBooking.start_date < end_date,
        VehicleBooking.end_date > start_date,
        VehicleBooking.status == 'confirmed'
    ).subquery()
    query = query.filter(~VehicleInventory.id.in_(booked))
    return query.all()

def book_vehicle(db: Session, vehicle_id: UUID, travel_request_id: UUID, start_date: datetime, end_date: datetime):
    booking = VehicleBooking(
        vehicle_id=vehicle_id,
        travel_request_id=travel_request_id,
        start_date=start_date,
        end_date=end_date,
        status='confirmed'
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking