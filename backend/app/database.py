"""Database configuration for Numo application."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL from environment or default SQLite
# For development: uses backend/data/numo.db
# For production (Docker): use DATABASE_URL env var (defaults to /app/data/numo.db)
if os.getenv('DATABASE_URL'):
    DATABASE_URL = os.getenv('DATABASE_URL')
else:
    # Development: relative path
    db_dir = Path(__file__).parent.parent.parent / 'data'
    db_dir.mkdir(exist_ok=True)
    DATABASE_URL = f'sqlite:///{db_dir}/numo.db'

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={'check_same_thread': False} if 'sqlite' in DATABASE_URL else {}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()


def init_db():
    """Initialize the database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
