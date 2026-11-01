from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime, date
from typing import Optional, List, Dict
from uuid import UUID
from decimal import Decimal

# ==================== User schemas ====================
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = 'client'
    user_type: Optional[str] = 'client'

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    user_type: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    user_type: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ==================== Travel Request schemas ====================
class TravelRequestCreate(BaseModel):
    action_type: str          # quote, reservation, booking
    service_type: str
    full_name: str
    phone: str
    email: Optional[str] = None
    pickup_location: Optional[str] = None
    destination: Optional[str] = None
    travel_date: Optional[datetime] = None
    passengers: Optional[int] = None
    preferred_vehicle: Optional[str] = None
    base_amount: Optional[Decimal] = 0
    notes: Optional[str] = None

class TravelRequestResponse(TravelRequestCreate):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TravelRequestUpdate(BaseModel):
    request_status: Optional[str] = None
    payment_status: Optional[str] = None


# ==================== Insurance Request schemas ====================
class InsuranceRequestCreate(BaseModel):
    # Client Details
    buyer_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    nrc_passport: Optional[str] = None
    white_name: Optional[str] = None

    # Insurance Type
    insurance_type: str  # motor_vehicle, motorcycle, property, life, health, travel, other
    other_insurance_type: Optional[str] = None

    # Motor Details (for vehicle & motorcycle)
    vehicle_type: Optional[str] = None          # Private Car, Commercial Vehicle, etc.
    vehicle_make_model: Optional[str] = None
    number_plate: Optional[str] = None
    chasis_number: Optional[str] = None
    engine_number: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_value: Optional[Decimal] = 0
    year_of_manufacture: Optional[int] = None
    motorcycle_type: Optional[str] = None      # Sport, Cruiser, Scooter, etc.

    # Property Details
    property_address: Optional[str] = None
    property_type: Optional[str] = None        # House, Apartment, Office, Shop
    property_value: Optional[Decimal] = 0
    property_size: Optional[str] = None        # square meters

    # Life & Health Details
    occupation: Optional[str] = None
    employer: Optional[str] = None
    monthly_income: Optional[Decimal] = 0
    existing_conditions: Optional[str] = None
    smoker: Optional[bool] = False
    alcohol_consumption: Optional[bool] = False

    # Travel Details
    destination_country: Optional[str] = None
    travel_start_date: Optional[datetime] = None
    travel_end_date: Optional[datetime] = None
    purpose_of_travel: Optional[str] = None
    
    # Public Liability Details (NEW)
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    premises_address: Optional[str] = None
    estimated_turnover: Optional[Decimal] = 0
    coverage_amount: Optional[Decimal] = 0
    public_liability_notes: Optional[str] = None

    # Policy Details
    insurance_company_id: Optional[UUID] = None
    start_date: Optional[str] = None           # "YYYY-MM-DD"
    quarters: Optional[int] = 1
    base_premium: Optional[Decimal] = 0
    notes: Optional[str] = None

class InsuranceRequestResponse(BaseModel):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    buyer_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    nrc_passport: Optional[str] = None
    white_book_name: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    premises_address: Optional[str] = None
    estimated_turnover: Optional[Decimal] = 0
    coverage_amount: Optional[Decimal] = 0
    public_liability_notes: Optional[str] = None
    insurance_type: str
    other_insurance_type: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_make_model: Optional[str] = None
    number_plate: Optional[str] = None
    chasis_number: Optional[str] = None
    engine_number: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_value: Optional[Decimal] = 0
    year_of_manufacture: Optional[int] = None
    motorcycle_type: Optional[str] = None
    property_address: Optional[str] = None
    property_type: Optional[str] = None
    property_value: Optional[Decimal] = 0
    property_size: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    monthly_income: Optional[Decimal] = 0
    existing_conditions: Optional[str] = None
    smoker: Optional[bool] = False
    alcohol_consumption: Optional[bool] = False
    destination_country: Optional[str] = None
    travel_start_date: Optional[datetime] = None
    travel_end_date: Optional[datetime] = None
    purpose_of_travel: Optional[str] = None
    insurance_company_id: Optional[UUID] = None
    insurance_company_name: Optional[str] = None
    start_date: datetime
    quarters: int
    cover_days: int
    expiry_date: datetime
    base_premium: Decimal
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    notes: Optional[str] = None
    white_book_file: Optional[str] = None
    road_tax_disc_file: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    
# ==================== Quotation schemas ====================
class QuotationCreate(BaseModel):
    request_type: str
    request_id: UUID
    quote_title: str
    quote_details: str
    base_amount: Decimal
    service_fee: Decimal
    total_amount: Decimal
    validity_date: Optional[date] = None

class QuotationResponse(QuotationCreate):
    id: UUID
    quotation_reference: str
    customer_name: str
    customer_phone: Optional[str]
    customer_email: Optional[EmailStr]
    status: str
    payment_status: Optional[str] = None
    created_by: Optional[UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Invoice schemas ====================
class InvoiceCreate(BaseModel):
    request_type: str
    request_id: UUID
    invoice_title: str
    invoice_details: str
    total_amount: Decimal
    due_date: Optional[date] = None

class InvoiceResponse(InvoiceCreate):
    id: UUID
    invoice_reference: str
    customer_name: str
    customer_phone: Optional[str]
    customer_email: Optional[EmailStr]
    amount_paid: Decimal
    balance: Decimal
    invoice_status: str
    created_by: Optional[UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Payment schemas ====================
class PaymentInitiate(BaseModel):
    request_type: str
    request_id: UUID
    customer_name: str
    customer_phone: str
    amount: Decimal
    payment_method: str

class PaymentResponse(BaseModel):
    payment_reference: str
    gateway_reference: Optional[str]
    client_secret: Optional[str]
    status: str

    model_config = ConfigDict(from_attributes=True)
    

# Add these after PaymentResponse

class ProviderInfo(BaseModel):
    provider: str
    name: str
    country: str
    deposit_operational: bool

class DepositInitiate(BaseModel):
    request_type: str
    request_id: UUID
    provider: str
    phone_number: str
    amount: Decimal

class DepositResponse(BaseModel):
    success: bool
    deposit_id: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    failure_reason: Optional[str] = None

class DepositCheckResponse(BaseModel):
    success: bool
    status: str  # COMPLETED, PROCESSING, FAILED, NOT_FOUND
    message: Optional[str] = None
    failure_reason: Optional[str] = None


# ==================== Visa Request schemas ====================
class VisaRequestCreate(BaseModel):
    applicant_name: str
    date_of_birth: datetime
    place_of_birth: Optional[str] = None
    gender: str
    nationality: str
    country_of_residence: str
    marital_status: Optional[str] = None
    phone: str
    email: str
    address: Optional[str] = None
    passport_number: str
    passport_issue_date: datetime
    passport_expiry_date: datetime
    passport_issuing_authority: Optional[str] = None
    destination_country: str
    visa_type: str
    purpose_of_visit: Optional[str] = None
    intended_arrival_date: Optional[datetime] = None
    intended_departure_date: Optional[datetime] = None
    duration_of_stay_days: Optional[int] = None
    previous_visits_to_country: Optional[bool] = False
    previous_visit_details: Optional[str] = None
    occupation: Optional[str] = None
    employer_name: Optional[str] = None
    employer_address: Optional[str] = None
    employer_phone: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    education_level: Optional[str] = None
    accommodation_in_destination: Optional[str] = None
    contact_person_in_destination: Optional[str] = None
    contact_phone_in_destination: Optional[str] = None
    health_insurance_policy: Optional[str] = None
    criminal_record_disclosure: Optional[str] = None
    special_requests: Optional[str] = None
    base_fee: Optional[Decimal] = 0
    notes: Optional[str] = None

class VisaRequestResponse(VisaRequestCreate):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    passport_photo_file: Optional[str]
    invitation_letter_file: Optional[str]
    proof_of_accommodation_file: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

  
# ==================== Chat schemas ====================
class ConversationResponse(BaseModel):
    id: UUID
    client_id: UUID
    officer_id: UUID
    request_type: Optional[str] = None
    request_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class MessageCreate(BaseModel):
    conversation_id: UUID
    content: str

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    is_read: bool
    created_at: datetime
    attachments: Optional[List[dict]] = None

    model_config = ConfigDict(from_attributes=True)

class AttachmentResponse(BaseModel):
    id: UUID
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ==================== Pricing schemas ====================
class FlightPriceRequest(BaseModel):
    airline_id: UUID
    origin: str
    destination: str
    travel_class: str

class InsurancePriceRequest(BaseModel):
    company_id: UUID
    vehicle_type: str
    insurance_type: str
    quarters: int

class PriceResponse(BaseModel):
    price_available: bool
    amount: Optional[Decimal] = 0
    message: str = ""

    model_config = ConfigDict(from_attributes=True)

# ==================== Document schemas ====================
class ServiceDocumentResponse(BaseModel):
    id: UUID
    request_type: str
    request_id: UUID
    title: str
    file_name: str
    file_path: str
    uploaded_by: UUID
    uploaded_at: datetime


    model_config = ConfigDict(from_attributes=True)

class VehicleCreate(BaseModel):
    number_plate: str
    model: str
    type: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    daily_rate: Optional[Decimal] = None
    is_available: bool = True
    can_hire_external: bool = False

class VehicleResponse(VehicleCreate):
    id: UUID
    created_at: datetime


    model_config = ConfigDict(from_attributes=True)


# ==================== Car Hire schemas ====================
class CarHireRequestCreate(BaseModel):
    full_name: str
    phone: str
    email: str
    id_type: str
    id_number: str
    driver_license_number: str
    driver_license_expiry: datetime
    nationality: Optional[str] = None
    physical_address: Optional[str] = None          # new
    pickup_location: str
    dropoff_location: Optional[str] = None
    pickup_date: datetime
    pickup_time: Optional[str] = None
    dropoff_date: Optional[datetime] = None
    dropoff_time: Optional[str] = None
    rental_duration_days: Optional[int] = None
    vehicle_type: Optional[str] = None
    preferred_model: Optional[str] = None
    transmission: Optional[str] = None
    fuel_policy: Optional[str] = None
    additional_drivers: Optional[int] = 0
    child_seat: Optional[bool] = False
    gps_navigation: Optional[bool] = False
    # base_amount removed from here (optional if you keep it)
    notes: Optional[str] = None
    # New fields
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    business_occupation: Optional[str] = None
    emergency_contacts: Optional[List[dict]] = None
    travel_area: Optional[str] = None
    travel_town: Optional[str] = None

class CarHireRequestResponse(CarHireRequestCreate):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    driver_license_file: Optional[str]
    id_document_file: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    # Add new fields to response as well
    model_config = ConfigDict(from_attributes=True)

class AirportTransferRequestCreate(BaseModel):
    full_name: str
    phone: str
    email: str
    flight_number: str
    airline: Optional[str] = None
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    transfer_type: str  # 'pickup' or 'dropoff'
    pickup_location: str
    dropoff_location: str
    pickup_date: datetime
    pickup_time: Optional[str] = None
    passengers: Optional[int] = 1
    luggage_count: Optional[int] = 0
    vehicle_type: Optional[str] = None
    special_requests: Optional[str] = None
    base_amount: Optional[Decimal] = 0
    notes: Optional[str] = None

class AirportTransferRequestResponse(AirportTransferRequestCreate):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)



# ==================== Flight Request schemas ====================
class FlightRequestCreate(BaseModel):
    full_name: str
    passport_number: Optional[str] = None          # now optional
    passport_expiry: Optional[datetime] = None     # now optional
    nationality: Optional[str] = None              # now optional
    date_of_birth: Optional[datetime] = None       # now optional
    gender: Optional[str] = None                   # now optional
    phone: str
    email: str
    address: Optional[str] = None

    # New fields
    trip_type: str = 'one_way'                     # one_way, round_trip, multi_city
    flight_type: str = 'international'             # local, international
    segments: Optional[List[Dict[str, str]]] = None  # for multi-city: list of {origin, destination, travel_date}

    airline_id: Optional[UUID] = None
    origin: str
    destination: str
    travel_date: datetime
    return_date: Optional[datetime] = None
    travel_class: str
    passengers: int
    meal_preference: Optional[str] = None
    seat_preference: Optional[str] = None
    special_assistance: Optional[str] = None
    base_amount: Optional[Decimal] = 0
    notes: Optional[str] = None

class FlightRequestResponse(FlightRequestCreate):
    id: UUID
    request_reference: str
    user_id: Optional[UUID]
    service_fee: Decimal
    total_amount: Decimal
    request_status: str
    payment_status: str
    passport_file: Optional[str]
    visa_file: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
# ==================== News schemas ====================
class NewsBase(BaseModel):
    title: str
    content: str
    category: str  # 'image', 'video', 'text'
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_published: bool = True
    is_featured: bool = False

class NewsCreate(NewsBase):
    pass

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None

class NewsResponse(NewsBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)