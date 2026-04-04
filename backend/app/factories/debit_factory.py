"""Factory for generating Debit instances."""
import factory
from datetime import datetime, timedelta
from ..models import Debit
from .category_factory import CategoryFactory
from .place_factory import PlaceFactory


class DebitFactory(factory.Factory):
    """Factory for creating Debit instances."""

    class Meta:
        model = Debit

    category = factory.SubFactory(CategoryFactory)
    place = factory.SubFactory(PlaceFactory)
    debited_at = factory.Faker('date_time', tzinfo=None)
    amount = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    concept = factory.Faker('sentence')
    observations = factory.Faker('sentence')
