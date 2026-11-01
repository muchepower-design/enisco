from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
import os
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, TravelRequest, InsuranceRequest, VisaRequest
from ..crud.documents import create_document, get_documents_for_request
from ..schemas import ServiceDocumentResponse

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload/{request_type}/{request_id}")
async def upload_service_document(
    request_type: str,
    request_id: UUID,
    title: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin", "manager", "operations_manager"])),
    db: Session = Depends(get_db)
):
    model_map = {
        "travel": TravelRequest,
        "insurance": InsuranceRequest,
        "visa": VisaRequest
    }
    model = model_map.get(request_type)
    if not model:
        raise HTTPException(400, "Invalid request type")
    req = db.query(model).filter(model.id == request_id).first()
    if not req:
        raise HTTPException(404, "Request not found")
    if req.payment_status != "paid":
        raise HTTPException(400, "Request not paid yet")

    upload_dir = f"/home/kanchinn/pythonenisco/uploads/{request_type}"
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(upload_dir, safe_filename)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = create_document(db, request_type, request_id, title, file.filename, file_path, current_user.id)
    req.request_status = "completed"
    db.commit()
    return {"message": "Document uploaded", "document": doc}

@router.get("/{request_type}/{request_id}")
def get_documents(
    request_type: str,
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = get_documents_for_request(db, request_type, request_id)
    return docs

@router.get("/my")
def get_my_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Collect all documents from requests belonging to this user
    from ..models import ServiceDocument, TravelRequest, InsuranceRequest, VisaRequest
    user_id = current_user.id
    # Get all request IDs for this user
    travel_ids = [r.id for r in db.query(TravelRequest.id).filter(TravelRequest.user_id == user_id).all()]
    insurance_ids = [r.id for r in db.query(InsuranceRequest.id).filter(InsuranceRequest.user_id == user_id).all()]
    visa_ids = [r.id for r in db.query(VisaRequest.id).filter(VisaRequest.user_id == user_id).all()]
    docs = db.query(ServiceDocument).filter(
        (ServiceDocument.request_type == "travel" and ServiceDocument.request_id.in_(travel_ids)) |
        (ServiceDocument.request_type == "insurance" and ServiceDocument.request_id.in_(insurance_ids)) |
        (ServiceDocument.request_type == "visa" and ServiceDocument.request_id.in_(visa_ids))
    ).all()
    # Add download URL for each
    result = []
    for d in docs:
        result.append({
            "id": d.id,
            "request_type": d.request_type,
            "title": d.title,
            "file_name": d.file_name,
            "url": f"/uploads/{d.request_type}/{os.path.basename(d.file_path)}",
            "uploaded_at": d.uploaded_at
        })
    return result