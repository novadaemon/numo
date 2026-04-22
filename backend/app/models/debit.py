"""Debit model for expense tracking."""
from datetime import datetime, date
from enum import Enum
from sqlalchemy import Column, Integer, Float, String, DateTime, Date, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from ..database import Base


class DebitMethod(str, Enum):
    """Enum for debit payment methods."""
    DEBIT = 'debit'
    CREDIT = 'credit'
    CASH = 'cash'


class Debit(Base):
    """Represents an expense (debit) transaction."""

    __tablename__ = 'debits'

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey('places.id'), nullable=False, index=True)
    concept = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    method = Column(SQLEnum(DebitMethod), nullable=False, default=DebitMethod.CASH)
    observations = Column(Text, nullable=True)
    expensed_at = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    category = relationship('Category', back_populates='debits')
    place = relationship('Place', back_populates='debits')

    def __repr__(self):
        return (
            f'<Debit(id={self.id}, category_id={self.category_id}, '
            f'place_id={self.place_id}, amount={self.amount}, method={self.method})>'
        )
