# backend/app/models.py
from sqlalchemy import Column, String, DateTime, Boolean, Numeric, Integer, Enum, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(50))
    password_hash = Column(String(255), nullable=False)
    user_type = Column(Enum('client', 'staff', 'manager', 'admin', name='user_type_enum'), nullable=False)
    role = Column(Enum('client', 'sales_officer', 'finance_officer', 'operations_manager', 'admin', name='role_enum'), default='client')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    travel_requests = relationship("TravelRequest", back_populates="user")
    insurance_requests = relationship("InsuranceRequest", back_populates="user")
    quotations = relationship("Quotation", foreign_keys="Quotation.created_by")
    invoices = relationship("Invoice", foreign_keys="Invoice.created_by")
    payments = relationship("Payment", foreign_keys="Payment.user_id")
    activity_logs = relationship("ActivityLog", back_populates="user")
    visa_requests = relationship("VisaRequest", back_populates="user")
    flight_requests = relationship("FlightRequest", back_populates="user")
    carhire_requests = relationship("CarHireRequest", back_populates="user")
    airporttransfer_requests = relationship("AirportTransferRequest", back_populates="user")
    news = relationship("News", foreign_keys="News.created_by")

class ServiceFeeSetting(Base):
    __tablename__ = "service_fee_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_type = Column(Enum('flight_ticketing', 'insurance', 'visa', name='service_type_enum'), nullable=False)
    fee_type = Column(Enum('percentage', 'fixed', name='fee_type_enum'), default='percentage')
    fee_value = Column(Numeric(10,2), nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TravelRequest(Base):
    __tablename__ = "travel_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_reference = Column(String(50), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action_type = Column(Enum('quote', 'reservation', 'booking', name='action_type_enum'), nullable=False)
    service_type = Column(Enum('airport_transfer', 'vehicle_rental', 'flight_ticketing', name='travel_service_type_enum'), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150))
    pickup_location = Column(String(255))
    destination = Column(String(255))
    travel_date = Column(DateTime)
    travel_time = Column(DateTime)
    passengers = Column(Integer)
    preferred_vehicle = Column(String(100))
    base_amount = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)
    payment_method = Column(String(50))
    notes = Column(Text)
    request_status = Column(Enum('request_received', 'quotation_sent', 'reserved', 'awaiting_payment', 'confirmed_booking', 'completed', 'cancelled', name='travel_status_enum'), default='request_received')
    payment_status = Column(Enum('pending', 'paid', 'failed', 'not_required', name='payment_status_enum'), default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    #updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="travel_requests")

class InsuranceRequest(Base):
    __tablename__ = "insurance_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_reference = Column(String(50), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    buyer_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150))
    vehicle_type = Column(String(100), nullable=True)           # was nullable=False
    vehicle_make_model = Column(String(150), nullable=True)     # was nullable=False
    number_plate = Column(String(50), nullable=True)
    insurance_type = Column(Enum('third_party', 'comprehensive', 'motor_vehicle', 'motorcycle', 'property', 'life', 'health', 'travel', 'other', name='insurance_type_enum'), nullable=False)
    start_date = Column(DateTime, nullable=False)
    quarters = Column(Integer, nullable=False)
    cover_days = Column(Integer, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    base_premium = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)
    payment_method = Column(String(50))
    request_status = Column(Enum('quote_generated', 'awaiting_documents', 'awaiting_payment', 'active_cover', 'expired', 'renewed', 'cancelled', name='insurance_status_enum'), default='quote_generated')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='insurance_payment_status_enum'), default='pending')
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Add to InsuranceRequest class
    business_name = Column(String(150), nullable=True)
    business_type = Column(String(100), nullable=True)
    premises_address = Column(String(255), nullable=True)
    estimated_turnover = Column(Numeric(12,2), nullable=True)
    coverage_amount = Column(Numeric(12,2), nullable=True)
    public_liability_notes = Column(Text, nullable=True)

    address = Column(String(255))
    nrc_passport = Column(String(50))
    white_book_name = Column(String(150), nullable=True)
    other_insurance_type = Column(String(100))
    chasis_number = Column(String(50))
    engine_number = Column(String(50))
    vehicle_color = Column(String(30))
    vehicle_value = Column(Numeric(12,2))
    year_of_manufacture = Column(Integer)
    motorcycle_type = Column(String(50))
    property_address = Column(String(255))
    property_type = Column(String(50))
    property_value = Column(Numeric(12,2))
    property_size = Column(String(50))
    occupation = Column(String(100))
    employer = Column(String(150))
    monthly_income = Column(Numeric(12,2))
    existing_conditions = Column(Text)
    smoker = Column(Boolean, default=False)
    alcohol_consumption = Column(Boolean, default=False)
    destination_country = Column(String(100))
    travel_start_date = Column(DateTime)
    travel_end_date = Column(DateTime)
    purpose_of_travel = Column(String(255))
    white_book_file = Column(String(255))
    road_tax_disc_file = Column(String(255))
    insurance_company_id = Column(UUID(as_uuid=True), ForeignKey("insurance_companies.id"), nullable=True)
    
    insurance_company = relationship("InsuranceCompany", foreign_keys=[insurance_company_id])
    user = relationship("User", back_populates="insurance_requests")

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_reference = Column(String(80), unique=True, nullable=False)
    request_type = Column(Enum('travel', 'insurance', 'visa', 'flight', 'carhire', 'airporttransfer', name='request_type_enum'), nullable=False)
    request_id = Column(UUID(as_uuid=True), nullable=False)  # can be travel_request.id or insurance_request.id
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # client
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(50))
    customer_email = Column(String(150))
    quote_title = Column(String(200), nullable=False)
    quote_details = Column(Text, nullable=False)
    base_amount = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)
    validity_date = Column(DateTime)
    status = Column(Enum('draft', 'sent', 'accepted', 'rejected', 'expired', name='quote_status_enum'), default='draft')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='payment_status_enum'), default='pending')
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # staff who created
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_reference = Column(String(80), unique=True, nullable=False)
    request_type = Column(Enum('flight', 'carhire', 'airporttransfer', 'insurance', 'quotation', name='request_type_enum'), nullable=False)
    request_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(50))
    customer_email = Column(String(150))
    invoice_title = Column(String(200), nullable=False)
    invoice_details = Column(Text, nullable=False)
    total_amount = Column(Numeric(12,2), nullable=False, default=0)
    amount_paid = Column(Numeric(12,2), default=0)
    balance = Column(Numeric(12,2), default=0)
    invoice_status = Column(Enum('unpaid', 'part_paid', 'paid', 'cancelled', name='invoice_status_enum'), default='unpaid')
    due_date = Column(DateTime)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    payments = relationship("Payment", back_populates="invoice")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_reference = Column(String(80), unique=True, nullable=False)
    request_type = Column(Enum('flight', 'carhire', 'airporttransfer', 'insurance', 'quotation', name='request_type_enum'), nullable=False)
    request_id = Column(UUID(as_uuid=True), nullable=False)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    amount = Column(Numeric(12,2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    gateway_reference = Column(String(150))
    payment_status = Column(Enum('pending', 'paid', 'failed', 'cancelled', name='payment_status_enum'), default='pending')
    deposit_id = Column(String(80), nullable=True)
    notes = Column(Text)
    webhook_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    invoice = relationship("Invoice", back_populates="payments")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="activity_logs")

class VisaRequest(Base):
    __tablename__ = "visa_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_reference = Column(String(50), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Personal details
    applicant_name = Column(String(150), nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    place_of_birth = Column(String(100))
    gender = Column(String(20), nullable=False)
    nationality = Column(String(100), nullable=False)
    country_of_residence = Column(String(100), nullable=False)
    marital_status = Column(String(20))  # single, married, divorced, widowed
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=False)
    address = Column(String(255))

    # Passport details
    passport_number = Column(String(50), nullable=False)
    passport_issue_date = Column(DateTime, nullable=False)
    passport_expiry_date = Column(DateTime, nullable=False)
    passport_issuing_authority = Column(String(100))

    # Travel details
    destination_country = Column(String(100), nullable=False)
    visa_type = Column(Enum('tourist', 'business', 'student', 'transit', 'work', name='visa_type_enum'), nullable=False)
    purpose_of_visit = Column(Text)
    intended_arrival_date = Column(DateTime)
    intended_departure_date = Column(DateTime)
    duration_of_stay_days = Column(Integer)
    previous_visits_to_country = Column(Boolean, default=False)
    previous_visit_details = Column(Text)

    # Employment / education
    occupation = Column(String(100))
    employer_name = Column(String(150))
    employer_address = Column(String(255))
    employer_phone = Column(String(50))
    monthly_income = Column(Numeric(12,2))
    education_level = Column(String(50))

    # Additional information
    accommodation_in_destination = Column(String(255))
    contact_person_in_destination = Column(String(150))
    contact_phone_in_destination = Column(String(50))
    health_insurance_policy = Column(String(100))
    criminal_record_disclosure = Column(Text)
    special_requests = Column(Text)

    # Document file paths
    passport_photo_file = Column(String(255))
    invitation_letter_file = Column(String(255))
    proof_of_accommodation_file = Column(String(255))

    # Financial (base_fee, service_fee, total_amount) already exist
    # We'll keep them
    base_fee = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)
    payment_method = Column(String(50))
    request_status = Column(Enum('pending_review', 'documents_required', 'processing', 'approved', 'rejected', 'completed', 'cancelled', name='visa_status_enum'), default='pending_review')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='visa_payment_status_enum'), default='pending')
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="visa_requests")

class VisaFeeSetting(Base):
    __tablename__ = "visa_fee_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    destination_country = Column(String(100), nullable=True)   # NULL means applies to all
    visa_type = Column(Enum('tourist', 'business', 'student', 'transit', 'work', name='visa_type_enum'), nullable=True)
    fee_type = Column(Enum('percentage', 'fixed', name='fee_type_enum'), default='percentage')
    fee_value = Column(Numeric(10,2), nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# Pricing tables
class Airline(Base):
    __tablename__ = "airlines"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    is_price_known = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FlightRoute(Base):
    __tablename__ = "flight_routes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    airline_id = Column(UUID(as_uuid=True), ForeignKey("airlines.id"))
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    travel_class = Column(Enum('economy', 'business', 'first', name='travel_class_enum'), nullable=False)
    base_price = Column(Numeric(12,2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InsuranceCompany(Base):
    __tablename__ = "insurance_companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    is_price_known = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InsurancePremium(Base):
    __tablename__ = "insurance_premiums"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("insurance_companies.id"))
    vehicle_type = Column(String(100))
    insurance_type = Column(Enum('third_party', 'comprehensive', name='insurance_type_enum'))
    base_premium_per_quarter = Column(Numeric(12,2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Vehicle inventory
class VehicleInventory(Base):
    __tablename__ = "vehicle_inventory"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    number_plate = Column(String(50), unique=True, nullable=False)
    model = Column(String(100), nullable=False)
    type = Column(String(50))
    hourly_rate = Column(Numeric(12,2))
    daily_rate = Column(Numeric(12,2))
    is_available = Column(Boolean, default=True)
    can_hire_external = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VehicleBooking(Base):
    __tablename__ = "vehicle_bookings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicle_inventory.id"))
    travel_request_id = Column(UUID(as_uuid=True), ForeignKey("travel_requests.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum('confirmed', 'cancelled', 'completed', name='booking_status_enum'), default='confirmed')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Chat system
class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    request_type = Column(String(50), nullable=True)
    request_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    attachments = relationship("Attachment", back_populates="message")

class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    message = relationship("Message", back_populates="attachments")

# Service documents (purchased tickets, insurance certificates, etc.)
class ServiceDocument(Base):
    __tablename__ = "service_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_type = Column(Enum('travel', 'insurance', 'visa', name='doc_request_type_enum'), nullable=False)
    request_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(200))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class FlightRequest(Base):
    __tablename__ = "flight_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    request_reference = Column(String(50), unique=True, nullable=False)

    # Personal (now nullable – required only for international)
    full_name = Column(String(150), nullable=False)
    passport_number = Column(String(50), nullable=True)          # was nullable=False
    passport_expiry = Column(DateTime, nullable=True)           # was nullable=False
    nationality = Column(String(100), nullable=True)            # was nullable=False
    date_of_birth = Column(DateTime, nullable=True)             # was nullable=False
    gender = Column(String(20), nullable=True)                  # was nullable=False

    # Contact
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=False)
    address = Column(String(255))

    # Flight details (new fields)
    trip_type = Column(String(20), nullable=False, default='one_way')      # one_way, round_trip, multi_city
    flight_type = Column(String(20), nullable=False, default='international')  # local, international
    segments = Column(JSON, nullable=True)                                 # list of {origin, destination, travel_date}

    # Existing flight fields
    airline_id = Column(UUID(as_uuid=True), ForeignKey("airlines.id"))
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    travel_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    travel_class = Column(String(20), nullable=False)
    passengers = Column(Integer, nullable=False)

    # Additional
    meal_preference = Column(String(50))
    seat_preference = Column(String(50))
    special_assistance = Column(String(255))

    # Financial
    base_amount = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)

    # Status
    request_status = Column(Enum('pending_quote', 'quotation_sent', 'awaiting_payment', 'confirmed', 'completed', 'cancelled', name='flight_status_enum'), default='pending_quote')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='flight_payment_status_enum'), default='pending')

    # Files
    passport_file = Column(String(255))
    visa_file = Column(String(255))
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="flight_requests")
    airline = relationship("Airline")

class CarHireRequest(Base):
    __tablename__ = "carhire_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    request_reference = Column(String(50), unique=True, nullable=False)

    # Personal details
    full_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=False)
    id_type = Column(String(20), nullable=False)
    id_number = Column(String(50), nullable=False)
    driver_license_number = Column(String(50), nullable=False)
    driver_license_expiry = Column(DateTime, nullable=False)
    nationality = Column(String(100))
    
    physical_address = Column(String(255), nullable=True)
    employment_status = Column(String(20), nullable=True)  # 'employed' or 'unemployed'
    employer_name = Column(String(150), nullable=True)
    business_occupation = Column(String(150), nullable=True)
    emergency_contacts = Column(JSON, nullable=True)      # list of contact objects
    travel_area = Column(String(30), nullable=True)       # 'within_lusaka' or 'outside_lusaka'
    travel_town = Column(String(100), nullable=True)

    # Rental details
    pickup_location = Column(String(255), nullable=False)
    dropoff_location = Column(String(255))
    pickup_date = Column(DateTime, nullable=False)
    pickup_time = Column(String(10))  # e.g., "14:30"
    dropoff_date = Column(DateTime)
    dropoff_time = Column(String(10))
    rental_duration_days = Column(Integer)  # computed or entered

    # Vehicle preferences
    vehicle_type = Column(String(50))      # e.g., "SUV", "Sedan", "Minibus"
    preferred_model = Column(String(100))
    transmission = Column(String(20))      # "Automatic", "Manual"
    fuel_policy = Column(String(50))       # "Full-to-Full", "Pre-paid"
    additional_drivers = Column(Integer, default=0)
    child_seat = Column(Boolean, default=False)
    gps_navigation = Column(Boolean, default=False)

    # Financial
    base_amount = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)

    # Status
    request_status = Column(Enum('pending_quote', 'quotation_sent', 'awaiting_payment', 'confirmed', 'completed', 'cancelled', name='carhire_status_enum'), default='pending_quote')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='carhire_payment_status_enum'), default='pending')

    # Files
    driver_license_file = Column(String(255))
    id_document_file = Column(String(255))

    # Notes
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="carhire_requests")


class AirportTransferRequest(Base):
    __tablename__ = "airporttransfer_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    request_reference = Column(String(50), unique=True, nullable=False)

    # Personal details
    full_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=False)
    flight_number = Column(String(20), nullable=False)
    airline = Column(String(100))
    arrival_time = Column(DateTime)   # when the flight lands
    departure_time = Column(DateTime) # if transfer to airport

    # Transfer details
    transfer_type = Column(Enum('pickup', 'dropoff', name='transfer_type_enum'), nullable=False)  # from airport to home/hotel, or from home/hotel to airport
    pickup_location = Column(String(255), nullable=False)
    dropoff_location = Column(String(255), nullable=False)
    pickup_date = Column(DateTime, nullable=False)
    pickup_time = Column(String(10))
    passengers = Column(Integer, default=1)
    luggage_count = Column(Integer, default=0)

    # Vehicle preferences
    vehicle_type = Column(String(50))   # e.g., "Sedan", "SUV", "Minibus"
    special_requests = Column(String(255))  # e.g., "wheelchair accessible", "child seat"

    # Financial
    base_amount = Column(Numeric(12,2), default=0)
    service_fee = Column(Numeric(12,2), default=0)
    total_amount = Column(Numeric(12,2), default=0)

    # Status
    request_status = Column(Enum('pending_quote', 'quotation_sent', 'awaiting_payment', 'confirmed', 'completed', 'cancelled', name='transfer_status_enum'), default='pending_quote')
    payment_status = Column(Enum('pending', 'paid', 'failed', name='transfer_payment_status_enum'), default='pending')

    # Notes
    notes = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="airporttransfer_requests")
    

class News(Base):
    __tablename__ = "news"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # 'image', 'video', 'text'
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)  # can be embed URL or local file path
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[created_by])    
   
# Tour Packages
class TourPackage(Base):
    __tablename__ = "tour_packages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    destination = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False)
    duration_nights = Column(Integer, nullable=False)
    base_price = Column(Numeric(12,2), nullable=False)
    service_fee = Column(Numeric(12,2), default=0)
    total_price = Column(Numeric(12,2), nullable=False)
    inclusions = Column(Text)       # e.g., "Hotel, Meals, Transport"
    exclusions = Column(Text)       # e.g., "Airfare, Visa"
    highlights = Column(Text)       # list of highlights
    max_people = Column(Integer, default=10)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    images = Column(JSON, default=list)  # array of image paths
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", foreign_keys=[created_by])
    bookings = relationship("TourBooking", back_populates="package")

class TourBooking(Base):
    __tablename__ = "tour_bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    package_id = Column(UUID(as_uuid=True), ForeignKey("tour_packages.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    booking_reference = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    number_of_people = Column(Integer, nullable=False)
    special_requests = Column(Text)
    total_amount = Column(Numeric(12,2), nullable=False)
    payment_status = Column(Enum('pending', 'paid', 'failed', name='booking_payment_status_enum'), default='pending')
    booking_status = Column(Enum('pending', 'confirmed', 'cancelled', 'completed', name='booking_status_enum'), default='pending')
    payment_reference = Column(String(80))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    package = relationship("TourPackage", back_populates="bookings")
    user = relationship("User", foreign_keys=[user_id])
    
    