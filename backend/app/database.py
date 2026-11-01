from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Calculate pool size and recycle time
POOL_SIZE = 5               # Max connections per worker
MAX_OVERFLOW = 10           # Extra connections if pool is full
POOL_RECYCLE = 3600         # Recycle connections after 1 hour (less than PostgreSQL's idle timeout)

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_pre_ping=True,      # ✅ Checks connection before using it
    pool_recycle=POOL_RECYCLE,
    pool_use_lifo=True       # Reuses the most recently used connection
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()