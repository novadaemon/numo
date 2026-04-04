"""Factory for generating Category instances."""
import factory
from ..models import Category


class CategoryFactory(factory.Factory):
    """Factory for creating Category instances."""

    class Meta:
        model = Category

    name = factory.Faker('word')
