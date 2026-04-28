"""Factory for generating Concept instances."""
import factory
from ..models import Concept


class ConceptFactory(factory.Factory):
    """Factory for creating Concept instances."""

    class Meta:
        model = Concept

    name = factory.Faker('word')
