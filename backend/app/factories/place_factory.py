"""Factory for generating Place instances."""
import factory
from ..models import Place


class PlaceFactory(factory.Factory):
    """Factory for creating Place instances."""

    class Meta:
        model = Place

    name = factory.Sequence(lambda n: f"Place {n}")
