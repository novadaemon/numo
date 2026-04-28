"""Factory for generating Debit instances."""
import factory
import random
from datetime import datetime, date, timedelta
from ..models import Debit, DebitMethod
from .category_factory import CategoryFactory
from .place_factory import PlaceFactory


class DebitFactory(factory.Factory):
    """Factory for creating Debit instances."""

    class Meta:
        model = Debit

    category = factory.SubFactory(CategoryFactory)
    place = factory.SubFactory(PlaceFactory)
    amount = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    method = factory.LazyFunction(lambda: random.choice(list(DebitMethod)))
    observations = factory.Faker('sentence')
    expensed_at = factory.Faker('date_object')
