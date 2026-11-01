from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from uuid import UUID
from datetime import datetime
from ..models import Conversation, Message, Attachment

def create_conversation(db: Session, client_id: UUID, officer_id: UUID, request_type: str = None, request_id: UUID = None):
    conv = Conversation(
        client_id=client_id,
        officer_id=officer_id,
        request_type=request_type,
        request_id=request_id,
        updated_at=datetime.utcnow()  # set initial updated_at
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

def get_conversations_for_user(db: Session, user_id: UUID):
    return db.query(Conversation).filter(
        (Conversation.client_id == user_id) | (Conversation.officer_id == user_id)
    ).order_by(Conversation.updated_at.desc()).all()

def add_message(db: Session, conversation_id: UUID, sender_id: UUID, content: str):
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    # Update conversation's updated_at
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        conv.updated_at = datetime.utcnow()
        db.commit()
    return msg

def get_messages(db: Session, conversation_id: UUID, skip: int = 0, limit: int = 50):
    return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).offset(skip).limit(limit).all()

def mark_messages_read(db: Session, conversation_id: UUID, user_id: UUID):
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != user_id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()