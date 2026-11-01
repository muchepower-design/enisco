import os
import json
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/enisco")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    PAYMENT_GATEWAY = os.getenv("PAYMENT_GATEWAY", "mock")
    STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    FLIGHT_SERVICE_FEE_PERCENT = 10.0
    INSURANCE_SERVICE_FEE_PERCENT = 5.0
    
    # Read CORS origins from environment variable (JSON array)
    cors_str = os.getenv("BACKEND_CORS_ORIGINS", "[]")
    try:
        CORS_ORIGINS = json.loads(cors_str)
    except:
        CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

settings = Settings()