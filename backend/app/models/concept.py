"""Concept model for expense tracking."""
from sqlalchemy import Column, Integer, String
from ..database import Base


class Concept(Base):
    """Represents a concept."""

    __tablename__ = 'concepts'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Concept(id={self.id}, name={self.name})>'
