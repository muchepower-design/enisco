#!/usr/bin/env python
"""Create database tables and seed initial data.

Run this script after setting up the database and before starting the application.
"""

import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models
from app.auth import get_password_hash

def create_tables():
    """Create all tables defined in models."""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        sys.exit(1)

def seed_users(db):
    """Seed users with different roles (all emails @eniscotours.com)."""
    print("Seeding users...")
    users_data = [
        # Admin
        {"full_name": "System Administrator", "email": "admin@eniscotours.com", "phone": "+260975000001", "user_type": "admin", "role": "admin"},
        # Managers
        {"full_name": "Operations Manager", "email": "manager@eniscotours.com", "phone": "+260975000002", "user_type": "manager", "role": "operations_manager"},
        {"full_name": "Finance Manager", "email": "finance@eniscotours.com", "phone": "+260975000003", "user_type": "manager", "role": "finance_officer"},
        # Staff
        {"full_name": "Sales Officer One", "email": "sales@eniscotours.com", "phone": "+260975000004", "user_type": "staff", "role": "sales_officer"},
        {"full_name": "Customer Support Agent", "email": "support@eniscotours.com", "phone": "+260975000005", "user_type": "staff", "role": "sales_officer"},
        # Clients
        {"full_name": "John Doe", "email": "john.doe@eniscotours.com", "phone": "+260977000001", "user_type": "client", "role": "client"},
        {"full_name": "Jane Smith", "email": "jane.smith@eniscotours.com", "phone": "+260977000002", "user_type": "client", "role": "client"},
        {"full_name": "Peter Mwale", "email": "peter.mwale@eniscotours.com", "phone": "+260977000003", "user_type": "client", "role": "client"},
    ]
    for u in users_data:
        existing = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not existing:
            hashed = get_password_hash("1234")
            user = models.User(
                full_name=u["full_name"],
                email=u["email"],
                phone=u["phone"],
                password_hash=hashed,
                user_type=u["user_type"],
                role=u["role"],
                is_active=True
            )
            db.add(user)
    db.commit()
    print(f"Seeded {len(users_data)} users.")

def seed_airlines(db):
    """Seed airlines serving Zambia."""
    print("Seeding airlines...")
    airlines_data = [
        {"name": "Emirates", "code": "EK", "is_price_known": True},
        {"name": "Ethiopian Airlines", "code": "ET", "is_price_known": True},
        {"name": "Qatar Airways", "code": "QR", "is_price_known": True},
        {"name": "Kenya Airways", "code": "KQ", "is_price_known": True},
        {"name": "South African Airways", "code": "SA", "is_price_known": True},
        {"name": "Proflight Zambia", "code": "P0", "is_price_known": True},
        {"name": "RwandAir", "code": "WB", "is_price_known": True},
        {"name": "Turkish Airlines", "code": "TK", "is_price_known": True},
        {"name": "British Airways", "code": "BA", "is_price_known": True},
        {"name": "Air France", "code": "AF", "is_price_known": True},
    ]
    for a in airlines_data:
        existing = db.query(models.Airline).filter(models.Airline.code == a["code"]).first()
        if not existing:
            airline = models.Airline(name=a["name"], code=a["code"], is_price_known=a["is_price_known"])
            db.add(airline)
    db.commit()
    print("Seeded airlines.")

def seed_flight_routes(db):
    """Seed flight routes from Lusaka (LUN) to common destinations."""
    print("Seeding flight routes...")
    airlines = {a.code: a.id for a in db.query(models.Airline).all()}
    routes = [
        {"airline_code": "EK", "origin": "LUN", "destination": "DXB", "travel_class": "economy", "base_price": 4500},
        {"airline_code": "EK", "origin": "LUN", "destination": "DXB", "travel_class": "business", "base_price": 12000},
        {"airline_code": "ET", "origin": "LUN", "destination": "ADD", "travel_class": "economy", "base_price": 3500},
        {"airline_code": "ET", "origin": "LUN", "destination": "ADD", "travel_class": "business", "base_price": 9000},
        {"airline_code": "QR", "origin": "LUN", "destination": "DOH", "travel_class": "economy", "base_price": 4800},
        {"airline_code": "KQ", "origin": "LUN", "destination": "NBO", "travel_class": "economy", "base_price": 2800},
        {"airline_code": "SA", "origin": "LUN", "destination": "JNB", "travel_class": "economy", "base_price": 2200},
        {"airline_code": "P0", "origin": "LUN", "destination": "NLA", "travel_class": "economy", "base_price": 1200},
        {"airline_code": "P0", "origin": "LUN", "destination": "LVI", "travel_class": "economy", "base_price": 1500},
        {"airline_code": "WB", "origin": "LUN", "destination": "KGL", "travel_class": "economy", "base_price": 3200},
        {"airline_code": "TK", "origin": "LUN", "destination": "IST", "travel_class": "economy", "base_price": 5200},
        {"airline_code": "BA", "origin": "LUN", "destination": "LHR", "travel_class": "economy", "base_price": 6800},
        {"airline_code": "AF", "origin": "LUN", "destination": "CDG", "travel_class": "economy", "base_price": 6200},
    ]
    for r in routes:
        airline_id = airlines.get(r["airline_code"])
        if not airline_id:
            continue
        existing = db.query(models.FlightRoute).filter(
            models.FlightRoute.airline_id == airline_id,
            models.FlightRoute.origin == r["origin"],
            models.FlightRoute.destination == r["destination"],
            models.FlightRoute.travel_class == r["travel_class"]
        ).first()
        if not existing:
            route = models.FlightRoute(
                airline_id=airline_id,
                origin=r["origin"],
                destination=r["destination"],
                travel_class=r["travel_class"],
                base_price=Decimal(r["base_price"])
            )
            db.add(route)
    db.commit()
    print("Seeded flight routes.")

def seed_insurance_companies(db):
    """Seed insurance companies in Zambia."""
    print("Seeding insurance companies...")
    companies = [
        {"name": "Madison Insurance", "is_price_known": True},
        {"name": "Professional Insurance", "is_price_known": True},
        {"name": "Zanaco Insurance", "is_price_known": True},
        {"name": "NICO Insurance", "is_price_known": True},
        {"name": "Sanlam Zambia", "is_price_known": True},
        {"name": "Hollard Insurance", "is_price_known": True},
        {"name": "Britam Insurance", "is_price_known": True},
        {"name": "Prudential Zambia", "is_price_known": True},
        {"name": "Old Mutual Zambia", "is_price_known": True},
        {"name": "First Insurance", "is_price_known": True},
    ]
    for c in companies:
        existing = db.query(models.InsuranceCompany).filter(models.InsuranceCompany.name == c["name"]).first()
        if not existing:
            company = models.InsuranceCompany(name=c["name"], is_price_known=c["is_price_known"])
            db.add(company)
    db.commit()
    print("Seeded insurance companies.")

def seed_insurance_premiums(db):
    """Seed insurance premiums for common vehicle types."""
    print("Seeding insurance premiums...")
    companies = {c.name: c.id for c in db.query(models.InsuranceCompany).all()}
    premiums_data = [
        # Madison Insurance
        {"company_name": "Madison Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 250},
        {"company_name": "Madison Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 500},
        {"company_name": "Madison Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 400},
        {"company_name": "Madison Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 800},
        {"company_name": "Madison Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 120},
        {"company_name": "Madison Insurance", "vehicle_type": "Motorcycle", "insurance_type": "comprehensive", "premium_per_quarter": 250},
        # Professional Insurance
        {"company_name": "Professional Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 230},
        {"company_name": "Professional Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 480},
        {"company_name": "Professional Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 380},
        {"company_name": "Professional Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 780},
        {"company_name": "Professional Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 110},
        # Zanaco Insurance
        {"company_name": "Zanaco Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 260},
        {"company_name": "Zanaco Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 520},
        {"company_name": "Zanaco Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 390},
        {"company_name": "Zanaco Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 820},
        {"company_name": "Zanaco Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 115},
        # NICO Insurance
        {"company_name": "NICO Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 240},
        {"company_name": "NICO Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 490},
        {"company_name": "NICO Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 370},
        {"company_name": "NICO Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 790},
        {"company_name": "NICO Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 105},
        # Sanlam
        {"company_name": "Sanlam Zambia", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 255},
        {"company_name": "Sanlam Zambia", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 510},
        {"company_name": "Sanlam Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 395},
        {"company_name": "Sanlam Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 810},
        {"company_name": "Sanlam Zambia", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 120},
        # Hollard
        {"company_name": "Hollard Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 245},
        {"company_name": "Hollard Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 495},
        {"company_name": "Hollard Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 385},
        {"company_name": "Hollard Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 780},
        {"company_name": "Hollard Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 115},
        # Britam
        {"company_name": "Britam Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 235},
        {"company_name": "Britam Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 470},
        {"company_name": "Britam Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 370},
        {"company_name": "Britam Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 760},
        {"company_name": "Britam Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 100},
        # Prudential
        {"company_name": "Prudential Zambia", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 245},
        {"company_name": "Prudential Zambia", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 490},
        {"company_name": "Prudential Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 380},
        {"company_name": "Prudential Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 790},
        {"company_name": "Prudential Zambia", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 110},
        # Old Mutual
        {"company_name": "Old Mutual Zambia", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 250},
        {"company_name": "Old Mutual Zambia", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 510},
        {"company_name": "Old Mutual Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 400},
        {"company_name": "Old Mutual Zambia", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 800},
        {"company_name": "Old Mutual Zambia", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 120},
        # First Insurance
        {"company_name": "First Insurance", "vehicle_type": "Private Car", "insurance_type": "third_party", "premium_per_quarter": 230},
        {"company_name": "First Insurance", "vehicle_type": "Private Car", "insurance_type": "comprehensive", "premium_per_quarter": 460},
        {"company_name": "First Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "third_party", "premium_per_quarter": 360},
        {"company_name": "First Insurance", "vehicle_type": "Commercial Vehicle", "insurance_type": "comprehensive", "premium_per_quarter": 740},
        {"company_name": "First Insurance", "vehicle_type": "Motorcycle", "insurance_type": "third_party", "premium_per_quarter": 95},
    ]
    for p in premiums_data:
        company_id = companies.get(p["company_name"])
        if not company_id:
            continue
        existing = db.query(models.InsurancePremium).filter(
            models.InsurancePremium.company_id == company_id,
            models.InsurancePremium.vehicle_type == p["vehicle_type"],
            models.InsurancePremium.insurance_type == p["insurance_type"]
        ).first()
        if not existing:
            premium = models.InsurancePremium(
                company_id=company_id,
                vehicle_type=p["vehicle_type"],
                insurance_type=p["insurance_type"],
                base_premium_per_quarter=Decimal(p["premium_per_quarter"])
            )
            db.add(premium)
    db.commit()
    print("Seeded insurance premiums.")

def seed_vehicle_inventory(db):
    """Seed some vehicles for car hire."""
    print("Seeding vehicle inventory...")
    vehicles = [
        {"number_plate": "BAB 1001", "model": "Toyota Hilux", "type": "Double Cab", "daily_rate": 800, "hourly_rate": 100, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1002", "model": "Toyota Fortuner", "type": "SUV", "daily_rate": 1000, "hourly_rate": 120, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1003", "model": "Honda CR-V", "type": "SUV", "daily_rate": 750, "hourly_rate": 90, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1004", "model": "Toyota Corolla", "type": "Sedan", "daily_rate": 500, "hourly_rate": 60, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1005", "model": "Hyundai H1", "type": "Minibus", "daily_rate": 1200, "hourly_rate": 150, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1006", "model": "Ford Ranger", "type": "Double Cab", "daily_rate": 850, "hourly_rate": 110, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1007", "model": "Nissan Navara", "type": "Double Cab", "daily_rate": 820, "hourly_rate": 105, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1008", "model": "Toyota Prado", "type": "SUV", "daily_rate": 1500, "hourly_rate": 180, "is_available": True, "can_hire_external": True},
        {"number_plate": "BAB 1009", "model": "Toyota Hiace", "type": "Minibus", "daily_rate": 1400, "hourly_rate": 170, "is_available": True, "can_hire_external": False},
        {"number_plate": "BAB 1010", "model": "Mercedes C-Class", "type": "Sedan", "daily_rate": 900, "hourly_rate": 110, "is_available": True, "can_hire_external": False},
    ]
    for v in vehicles:
        existing = db.query(models.VehicleInventory).filter(models.VehicleInventory.number_plate == v["number_plate"]).first()
        if not existing:
            vehicle = models.VehicleInventory(
                number_plate=v["number_plate"],
                model=v["model"],
                type=v["type"],
                daily_rate=Decimal(v["daily_rate"]),
                hourly_rate=Decimal(v["hourly_rate"]),
                is_available=v["is_available"],
                can_hire_external=v["can_hire_external"]
            )
            db.add(vehicle)
    db.commit()
    print("Seeded vehicle inventory.")

def seed_service_fee_settings(db):
    """Set default service fees for flight ticketing, insurance, and visa."""
    print("Seeding service fee settings...")
    fees = [
        {"service_type": "flight_ticketing", "fee_type": "percentage", "fee_value": 10.0},
        {"service_type": "insurance", "fee_type": "percentage", "fee_value": 5.0},
        {"service_type": "visa", "fee_type": "percentage", "fee_value": 10.0},
    ]
    for fee in fees:
        existing = db.query(models.ServiceFeeSetting).filter(
            models.ServiceFeeSetting.service_type == fee["service_type"]
        ).first()
        if not existing:
            setting = models.ServiceFeeSetting(
                service_type=fee["service_type"],
                fee_type=fee["fee_type"],
                fee_value=Decimal(fee["fee_value"])
            )
            db.add(setting)
    db.commit()
    print("Seeded service fee settings (including visa).")

def seed_visa_fee_settings(db):
    """Seed visa fee settings for common destinations."""
    print("Seeding visa fee settings...")
    visa_fees = [
        {"destination_country": "United Kingdom", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 150},
        {"destination_country": "United States", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 160},
        {"destination_country": "South Africa", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 80},
        {"destination_country": "Kenya", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 50},
        {"destination_country": "United Arab Emirates", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 100},
        {"destination_country": "India", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 120},
        {"destination_country": "China", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 140},
        {"destination_country": "Turkey", "visa_type": "tourist", "fee_type": "fixed", "fee_value": 60},
        {"destination_country": "United Kingdom", "visa_type": "business", "fee_type": "fixed", "fee_value": 200},
        {"destination_country": "United States", "visa_type": "business", "fee_type": "fixed", "fee_value": 190},
    ]
    for vf in visa_fees:
        existing = db.query(models.VisaFeeSetting).filter(
            models.VisaFeeSetting.destination_country == vf["destination_country"],
            models.VisaFeeSetting.visa_type == vf["visa_type"]
        ).first()
        if not existing:
            setting = models.VisaFeeSetting(
                destination_country=vf["destination_country"],
                visa_type=vf["visa_type"],
                fee_type=vf["fee_type"],
                fee_value=Decimal(vf["fee_value"])
            )
            db.add(setting)
    db.commit()
    print("Seeded visa fee settings.")

def main():
    create_tables()
    db = SessionLocal()
    try:
        seed_users(db)
        seed_airlines(db)
        seed_flight_routes(db)
        seed_insurance_companies(db)
        seed_insurance_premiums(db)
        seed_vehicle_inventory(db)
        seed_service_fee_settings(db)
        seed_visa_fee_settings(db)
        print("All data seeded successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()