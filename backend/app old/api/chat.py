from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
import os
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Conversation, Message, Attachment
from ..crud.chat import (
    create_conversation, get_conversations_for_user, add_message,
    get_messages, mark_messages_read
)
from ..schemas import ConversationResponse, MessageCreate, MessageResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/conversations", response_model=ConversationResponse)
def start_conversation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If the current user is staff, assign them as officer; else find a staff
    if current_user.role in ["admin", "manager", "sales_officer", "operations_manager"]:
        officer_id = current_user.id
    else:
        staff = db.query(User).filter(User.role.in_(['admin', 'sales_officer'])).first()
        if not staff:
            raise HTTPException(status_code=500, detail="No staff available")
        officer_id = staff.id
    conv = create_conversation(db, current_user.id, officer_id, None, None)
    return conv

@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role in ["admin", "manager", "sales_officer", "finance_officer", "operations_manager"]:
        # Staff see all conversations
        return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    else:
        # Clients see only their own
        return db.query(Conversation).filter(
            (Conversation.client_id == current_user.id) | (Conversation.officer_id == current_user.id)
        ).order_by(Conversation.updated_at.desc()).all()

@router.post("/messages", response_model=MessageResponse)
def send_message(
    msg: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = add_message(db, msg.conversation_id, current_user.id, msg.content)
    return message

@router.get("/messages/{conversation_id}")
def get_message_history(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Allow staff to view any conversation
    if current_user.role not in ["admin", "manager", "sales_officer"]:
        if conv.client_id != current_user.id and conv.officer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    mark_messages_read(db, conversation_id, current_user.id)
    messages = get_messages(db, conversation_id)
    # Convert to dict and add attachment URLs
    result = []
    for m in messages:
        attachments = [{"id": str(a.id), "file_name": a.file_name, "file_path": a.file_path} for a in (m.attachments or [])]
        result.append({
            "id": str(m.id),
            "conversation_id": str(m.conversation_id),
            "sender_id": str(m.sender_id),
            "content": m.content,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat(),
            "attachments": attachments
        })
    return result

@router.post("/upload/{conversation_id}")
async def upload_file(
    conversation_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user is part of conversation
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv or (conv.client_id != current_user.id and conv.officer_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Save file
    upload_dir = "/home/kanchinn/pythonenisco/uploads/chat"
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(upload_dir, safe_filename)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create attachment record
    attachment = Attachment(
        message_id=None,
        file_name=file.filename,
        file_path=f"uploads/chat/{safe_filename}",
        file_size=len(content),
        mime_type=file.content_type
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    # Create a message with file name
    msg = add_message(db, conversation_id, current_user.id, f"📎 {file.filename}")
    attachment.message_id = msg.id
    db.commit()

    return {"message": "File uploaded", "attachment_id": str(attachment.id)}