from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import json
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, TourPackage, TourBooking
from ..schemas import TourPackageCreate, TourPackageUpdate, TourPackageResponse, TourBookingCreate, TourBookingResponse
from ..crud.tour_packages import create_tour_package, get_tour_package, get_all_tour_packages, update_tour_package, delete_tour_package, create_tour_booking, get_tour_booking, get_user_bookings
from ..utils.payments import calculate_service_fee

router = APIRouter(prefix="/api/tour-packages", tags=["tour-packages"])

# ---------- Public endpoints ----------
@router.get("/", response_model=List[TourPackageResponse])
def list_packages(skip: int = 0, limit: int = 100, featured: bool = False, db: Session = Depends(get_db)):
    q = db.query(TourPackage).filter(TourPackage.is_active == True)
    if featured:
        q = q.filter(TourPackage.is_featured == True)
    return q.order_by(TourPackage.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/featured", response_model=List[TourPackageResponse])
def featured_packages(limit: int = 5, db: Session = Depends(get_db)):
    return db.query(TourPackage).filter(TourPackage.is_active == True, TourPackage.is_featured == True).order_by(TourPackage.created_at.desc()).limit(limit).all()

@router.get("/{package_id}", response_model=TourPackageResponse)
def get_package(package_id: str, db: Session = Depends(get_db)):
    try:
        uuid_id = uuid.UUID(package_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    pkg = get_tour_package(db, uuid_id)
    if not pkg or not pkg.is_active:
        raise HTTPException(404, "Package not found")
    return pkg

# ---------- Booking ----------
@router.post("/book", response_model=TourBookingResponse)
def book_tour_package(
    booking: TourBookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get package
    pkg = get_tour_package(db, booking.package_id)
    if not pkg or not pkg.is_active:
        raise HTTPException(404, "Package not available")
    
    # Calculate total (service fee already included in total_price)
    # Use pkg.total_price * number_of_people
    total = pkg.total_price * booking.number_of_people
    
    booking_ref = f"TOUR-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    
    db_booking = create_tour_booking(
        db=db,
        package_id=booking.package_id,
        user_id=current_user.id,
        booking_reference=booking_ref,
        full_name=booking.full_name,
        email=booking.email,
        phone=booking.phone,
        number_of_people=booking.number_of_people,
        special_requests=booking.special_requests,
        total_amount=total,
        payment_status="pending",
        booking_status="pending"
    )
    return db_booking

# ---------- Admin endpoints ----------
@router.post("/", response_model=TourPackageResponse)
def create_package(
    title: str = Form(...),
    slug: str = Form(...),
    description: str = Form(...),
    destination: str = Form(...),
    duration_days: int = Form(...),
    duration_nights: int = Form(...),
    base_price: float = Form(...),
    service_fee: float = Form(0),
    total_price: float = Form(...),
    inclusions: str = Form(""),
    exclusions: str = Form(""),
    highlights: str = Form(""),
    max_people: int = Form(10),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    is_active: bool = Form(True),
    is_featured: bool = Form(False),
    image_files: List[UploadFile] = File(None),
    #current_user: User = Depends(require_role(["admin", "manager"])),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save images
    image_urls = []
    for img in image_files or []:
        os.makedirs("uploads/tour_packages", exist_ok=True)
        ext = img.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/tour_packages/{filename}"
        with open(path, "wb") as f:
            f.write(img.file.read())
        image_urls.append(path)
    
    pkg_data = {
        "title": title,
        "slug": slug,
        "description": description,
        "destination": destination,
        "duration_days": duration_days,
        "duration_nights": duration_nights,
        "base_price": base_price,
        "service_fee": service_fee,
        "total_price": total_price,
        "inclusions": inclusions,
        "exclusions": exclusions,
        "highlights": highlights,
        "max_people": max_people,
        "start_date": datetime.fromisoformat(start_date) if start_date else None,
        "end_date": datetime.fromisoformat(end_date) if end_date else None,
        "is_active": is_active,
        "is_featured": is_featured,
        "images": image_urls,
        "created_by": current_user.id
    }
    return create_tour_package(db, **pkg_data)

@router.put("/{package_id}", response_model=TourPackageResponse)
def update_package(
    package_id: str,
    title: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    destination: Optional[str] = Form(None),
    duration_days: Optional[int] = Form(None),
    duration_nights: Optional[int] = Form(None),
    base_price: Optional[float] = Form(None),
    service_fee: Optional[float] = Form(None),
    total_price: Optional[float] = Form(None),
    inclusions: Optional[str] = Form(None),
    exclusions: Optional[str] = Form(None),
    highlights: Optional[str] = Form(None),
    max_people: Optional[int] = Form(None),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    is_featured: Optional[bool] = Form(None),
    image_files: List[UploadFile] = File(None),
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(package_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    pkg = get_tour_package(db, uuid_id)
    if not pkg:
        raise HTTPException(404, "Package not found")
    
    data = {}
    if title is not None: data["title"] = title
    if slug is not None: data["slug"] = slug
    if description is not None: data["description"] = description
    if destination is not None: data["destination"] = destination
    if duration_days is not None: data["duration_days"] = duration_days
    if duration_nights is not None: data["duration_nights"] = duration_nights
    if base_price is not None: data["base_price"] = base_price
    if service_fee is not None: data["service_fee"] = service_fee
    if total_price is not None: data["total_price"] = total_price
    if inclusions is not None: data["inclusions"] = inclusions
    if exclusions is not None: data["exclusions"] = exclusions
    if highlights is not None: data["highlights"] = highlights
    if max_people is not None: data["max_people"] = max_people
    if start_date is not None: data["start_date"] = datetime.fromisoformat(start_date) if start_date else None
    if end_date is not None: data["end_date"] = datetime.fromisoformat(end_date) if end_date else None
    if is_active is not None: data["is_active"] = is_active
    if is_featured is not None: data["is_featured"] = is_featured
    
    # Handle new images (append to existing)
    if image_files:
        existing = pkg.images or []
        for img in image_files:
            os.makedirs("uploads/tour_packages", exist_ok=True)
            ext = img.filename.split('.')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            path = f"uploads/tour_packages/{filename}"
            with open(path, "wb") as f:
                f.write(img.file.read())
            existing.append(path)
        data["images"] = existing
    
    return update_tour_package(db, uuid_id, data)

@router.delete("/{package_id}")
def delete_package(
    package_id: str,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(package_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    if delete_tour_package(db, uuid_id):
        return {"message": "Package deleted"}
    raise HTTPException(404, "Package not found")

@router.get("/bookings/my", response_model=List[TourBookingResponse])
def my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_bookings(db, current_user.id)

# For admin to view all bookings
@router.get("/bookings", response_model=List[TourBookingResponse])
def all_bookings(current_user: User = Depends(require_role(["admin", "manager"])), db: Session = Depends(get_db)):
    return db.query(TourBooking).all()