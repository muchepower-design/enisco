from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user, require_role
from ..models import User, News
from ..schemas import NewsCreate, NewsUpdate, NewsResponse
from ..crud.news import create_news, get_news, get_all_news, update_news, delete_news, get_featured_news

router = APIRouter(prefix="/api/news", tags=["news"])

# Public endpoints
@router.get("/", response_model=List[NewsResponse])
def list_news(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_news(db, skip, limit, published_only=True)

@router.get("/featured", response_model=List[NewsResponse])
def featured_news(limit: int = 10, db: Session = Depends(get_db)):
    return get_featured_news(db, limit)

@router.get("/{news_id}", response_model=NewsResponse)
def get_news_item(news_id: str, db: Session = Depends(get_db)):
    try:
        uuid_id = uuid.UUID(news_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    news = get_news(db, uuid_id)
    if not news or not news.is_published:
        raise HTTPException(404, "News not found")
    return news

# Admin endpoints
@router.post("/", response_model=NewsResponse)
def create_news_item(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    is_published: bool = Form(True),
    is_featured: bool = Form(False),
    image: UploadFile = File(None),
    video: UploadFile = File(None),
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    # Save files if present
    image_url = None
    video_url = None

    if image:
        os.makedirs("uploads/news/images", exist_ok=True)
        ext = image.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/news/images/{filename}"
        with open(path, "wb") as f:
            f.write(image.file.read())
        image_url = path

    if video:
        os.makedirs("uploads/news/videos", exist_ok=True)
        ext = video.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/news/videos/{filename}"
        with open(path, "wb") as f:
            f.write(video.file.read())
        video_url = path

    news_data = {
        "title": title,
        "content": content,
        "category": category,
        "image_url": image_url,
        "video_url": video_url,
        "is_published": is_published,
        "is_featured": is_featured,
        "created_by": current_user.id
    }
    return create_news(db, **news_data)

@router.put("/{news_id}", response_model=NewsResponse)
def update_news_item(
    news_id: str,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    is_featured: Optional[bool] = Form(None),
    image: UploadFile = File(None),
    video: UploadFile = File(None),
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(news_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    news = get_news(db, uuid_id)
    if not news:
        raise HTTPException(404, "News not found")

    data = {}
    if title is not None: data["title"] = title
    if content is not None: data["content"] = content
    if category is not None: data["category"] = category
    if is_published is not None: data["is_published"] = is_published
    if is_featured is not None: data["is_featured"] = is_featured

    # Handle file uploads
    if image:
        os.makedirs("uploads/news/images", exist_ok=True)
        ext = image.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/news/images/{filename}"
        with open(path, "wb") as f:
            f.write(image.file.read())
        data["image_url"] = path
        # Delete old file if exists (optional)

    if video:
        os.makedirs("uploads/news/videos", exist_ok=True)
        ext = video.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"uploads/news/videos/{filename}"
        with open(path, "wb") as f:
            f.write(video.file.read())
        data["video_url"] = path

    return update_news(db, uuid_id, data)

@router.delete("/{news_id}")
def delete_news_item(
    news_id: str,
    current_user: User = Depends(require_role(["admin", "manager"])),
    db: Session = Depends(get_db)
):
    try:
        uuid_id = uuid.UUID(news_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID")
    news = get_news(db, uuid_id)
    if not news:
        raise HTTPException(404, "News not found")
    delete_news(db, uuid_id)
    return {"message": "News deleted successfully"}
    
@router.get("/ping")
def ping():
    return {"status": "ok", "message": "News router is active"}