"""Credit model for expense tracking."""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, Text
from ..database import Base


class Credit(Base):
    """Represents an income (credit) transaction."""

    __tablename__ = 'credits'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    amount = Column(Float, nullable=False)
    observations = Column(Text, nullable=True)

    def __repr__(self):
        return f'<Credit(id={self.id}, amount={self.amount})>'
