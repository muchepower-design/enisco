from sqlalchemy.orm import Session
from uuid import UUID
from ..models import ServiceDocument

def create_document(db: Session, request_type: str, request_id: UUID, title: str, file_name: str, file_path: str, uploaded_by: UUID):
    doc = ServiceDocument(
        request_type=request_type,
        request_id=request_id,
        title=title,
        file_name=file_name,
        file_path=file_path,
        uploaded_by=uploaded_by
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def get_documents_for_request(db: Session, request_type: str, request_id: UUID):
    return db.query(ServiceDocument).filter(
        ServiceDocument.request_type == request_type,
        ServiceDocument.request_id == request_id
    ).all()