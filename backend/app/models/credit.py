"""Credit model for expense tracking."""
from datetime import datetime, date
from sqlalchemy import Column, Integer, Float, DateTime, Date, Text
from ..database import Base


class Credit(Base):
    """Represents an income (credit) transaction."""

    __tablename__ = 'credits'

    id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    observations = Column(Text, nullable=True)
    credited_at = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Credit(id={self.id}, amount={self.amount})>'
