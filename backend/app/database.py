from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# Connect to the PostgreSQL database using the URL from .env
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy 2.0 Base class
class Base(DeclarativeBase):
    pass

# Dependency to get DB session in API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()