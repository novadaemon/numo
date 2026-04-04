"""Place model for expense tracking."""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..database import Base


class Place(Base):
    """Represents a place where expenses occur."""

    __tablename__ = 'places'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

    # Relationship
    debits = relationship('Debit', back_populates='place')

    def __repr__(self):
        return f'<Place(id={self.id}, name={self.name})>'
