from fastapi.staticfiles import StaticFiles
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import auth, travel, insurance, payments, quotations, invoices, webhooks, dashboard, visa, users, pricing, chat, documents, requests, operations, admin, carhire, airporttransfer, flight


# Base.metadata.create_all(bind=engine)  # removed – use init_db.py

app = FastAPI(title="Enisco API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount static files for uploaded documents
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Include routers
app.include_router(auth.router)
app.include_router(travel.router)
app.include_router(insurance.router)
app.include_router(payments.router)
app.include_router(quotations.router)
app.include_router(invoices.router)
app.include_router(webhooks.router)
app.include_router(dashboard.router)
app.include_router(visa.router)
app.include_router(users.router)
app.include_router(pricing.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(requests.router)
app.include_router(operations.router)
app.include_router(admin.router)
app.include_router(carhire.router)
app.include_router(airporttransfer.router)
app.include_router(flight.router)

@app.get("/")
def root():
    return {"message": "Enisco API is running", "status": "active"}