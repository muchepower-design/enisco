from sqlalchemy.orm import Session
from ..models import News
from uuid import UUID

def create_news(db: Session, **kwargs):
    news = News(**kwargs)
    db.add(news)
    db.commit()
    db.refresh(news)
    return news

def get_news(db: Session, news_id: UUID):
    return db.query(News).filter(News.id == news_id).first()

def get_all_news(db: Session, skip: int = 0, limit: int = 100, published_only: bool = True):
    q = db.query(News)
    if published_only:
        q = q.filter(News.is_published == True)
    return q.order_by(News.created_at.desc()).offset(skip).limit(limit).all()

def update_news(db: Session, news_id: UUID, data: dict):
    news = get_news(db, news_id)
    for key, value in data.items():
        setattr(news, key, value)
    db.commit()
    db.refresh(news)
    return news

def delete_news(db: Session, news_id: UUID):
    news = get_news(db, news_id)
    db.delete(news)
    db.commit()
    return True

def get_featured_news(db: Session, limit: int = 10):
    return db.query(News).filter(News.is_featured == True, News.is_published == True).order_by(News.created_at.desc()).limit(limit).all()