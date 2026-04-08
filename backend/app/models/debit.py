"""Debit model for expense tracking."""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Enum as SQLEnum
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
    place_id = Column(Integer, ForeignKey('places.id'), nullable=True, index=True)
    concept = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    amount = Column(Float, nullable=False)
    method = Column(SQLEnum(DebitMethod), nullable=False, default=DebitMethod.CASH)
    observations = Column(Text, nullable=True)

    # Relationships
    category = relationship('Category', back_populates='debits')
    place = relationship('Place', back_populates='debits')

    def __repr__(self):
        return (
            f'<Debit(id={self.id}, category_id={self.category_id}, '
            f'place_id={self.place_id}, amount={self.amount}, method={self.method})>'
        )
