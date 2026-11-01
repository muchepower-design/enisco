from sqlalchemy.orm import Session
from ..models import TourPackage, TourBooking
from uuid import UUID

def create_tour_package(db: Session, **kwargs):
    pkg = TourPackage(**kwargs)
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg

def get_tour_package(db: Session, package_id: UUID):
    return db.query(TourPackage).filter(TourPackage.id == package_id).first()

def get_all_tour_packages(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True):
    q = db.query(TourPackage)
    if active_only:
        q = q.filter(TourPackage.is_active == True)
    return q.order_by(TourPackage.created_at.desc()).offset(skip).limit(limit).all()

def update_tour_package(db: Session, package_id: UUID, data: dict):
    pkg = get_tour_package(db, package_id)
    if pkg:
        for key, value in data.items():
            setattr(pkg, key, value)
        db.commit()
        db.refresh(pkg)
    return pkg

def delete_tour_package(db: Session, package_id: UUID):
    pkg = get_tour_package(db, package_id)
    if pkg:
        db.delete(pkg)
        db.commit()
        return True
    return False

def create_tour_booking(db: Session, **kwargs):
    booking = TourBooking(**kwargs)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def get_tour_booking(db: Session, booking_id: UUID):
    return db.query(TourBooking).filter(TourBooking.id == booking_id).first()

def get_user_bookings(db: Session, user_id: UUID):
    return db.query(TourBooking).filter(TourBooking.user_id == user_id).order_by(TourBooking.created_at.desc()).all()