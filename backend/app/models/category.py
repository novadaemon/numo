"""Category model for expense tracking."""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..database import Base


class Category(Base):
    """Represents an expense category."""

    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    # Relationship
    debits = relationship('Debit', back_populates='category')

    def __repr__(self):
        return f'<Category(id={self.id}, name={self.name})>'
