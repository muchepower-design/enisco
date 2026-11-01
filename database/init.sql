-- database/init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('client', 'staff', 'manager', 'admin')),
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'sales_officer', 'finance_officer', 'operations_manager', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service fee settings
CREATE TABLE service_fee_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('flight_ticketing', 'insurance')),
    fee_type VARCHAR(20) DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed')),
    fee_value DECIMAL(10,2) NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Travel requests
CREATE TABLE travel_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('quote', 'reservation', 'booking')),
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('airport_transfer', 'vehicle_rental', 'flight_ticketing')),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    pickup_location VARCHAR(255),
    destination VARCHAR(255),
    travel_date DATE,
    travel_time TIME,
    passengers INT,
    preferred_vehicle VARCHAR(100),
    base_amount DECIMAL(12,2) DEFAULT 0,
    service_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50),
    notes TEXT,
    request_status VARCHAR(30) DEFAULT 'request_received',
    payment_status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance requests
CREATE TABLE insurance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    buyer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_make_model VARCHAR(150) NOT NULL,
    number_plate VARCHAR(50) NOT NULL,
    insurance_type VARCHAR(20) CHECK (insurance_type IN ('third_party', 'comprehensive')),
    start_date DATE NOT NULL,
    quarters INT NOT NULL,
    cover_days INT NOT NULL,
    expiry_date DATE NOT NULL,
    base_premium DECIMAL(12,2) DEFAULT 0,
    service_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50),
    request_status VARCHAR(30) DEFAULT 'quote_generated',
    payment_status VARCHAR(30) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_reference VARCHAR(80) UNIQUE NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('travel', 'insurance')),
    request_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    quote_title VARCHAR(200) NOT NULL,
    quote_details TEXT NOT NULL,
    base_amount DECIMAL(12,2) DEFAULT 0,
    service_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    validity_date DATE,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_reference VARCHAR(80) UNIQUE NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('travel', 'insurance')),
    request_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    invoice_title VARCHAR(200) NOT NULL,
    invoice_details TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    invoice_status VARCHAR(20) DEFAULT 'unpaid',
    due_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(80) UNIQUE NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('travel', 'insurance')),
    request_id UUID NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    user_id UUID REFERENCES users(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    gateway_reference VARCHAR(150),
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    webhook_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visa requests table
CREATE TABLE visa_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    applicant_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    destination_country VARCHAR(100) NOT NULL,
    visa_type VARCHAR(50) NOT NULL CHECK (visa_type IN ('tourist', 'business', 'student', 'transit', 'work')),
    passport_number VARCHAR(50) NOT NULL,
    travel_date DATE,
    base_fee DECIMAL(12,2) DEFAULT 0,   -- embassy/consulate fee
    service_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50),
    request_status VARCHAR(30) DEFAULT 'pending_review',
    payment_status VARCHAR(30) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visa service fee settings (overrides global if needed)
CREATE TABLE visa_fee_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_country VARCHAR(100),
    visa_type VARCHAR(50),
    fee_type VARCHAR(20) DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed')),
    fee_value DECIMAL(10,2) NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default visa service fee (10%)
INSERT INTO visa_fee_settings (id, fee_type, fee_value) 
VALUES (uuid_generate_v4(), 'percentage', 10.00);

-- Create indexes
CREATE INDEX idx_travel_requests_user ON travel_requests(user_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(request_status);
CREATE INDEX idx_insurance_requests_user ON insurance_requests(user_id);
CREATE INDEX idx_quotations_request ON quotations(request_id);
CREATE INDEX idx_invoices_request ON invoices(request_id);
CREATE INDEX idx_payments_request ON payments(request_id);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (id, full_name, email, password_hash, user_type, role) 
VALUES (uuid_generate_v4(), 'System Administrator', 'admin@enisco.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrL.HhKqXhK', 'admin', 'admin');

-- Insert default service fees
INSERT INTO service_fee_settings (id, service_type, fee_type, fee_value) VALUES 
(uuid_generate_v4(), 'flight_ticketing', 'percentage', 10.00),
(uuid_generate_v4(), 'insurance', 'percentage', 5.00);