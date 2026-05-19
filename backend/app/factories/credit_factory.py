"""Factory for generating Credit instances."""
import factory
from datetime import datetime
from ..models import Credit


class CreditFactory(factory.Factory):
    """Factory for creating Credit instances."""

    class Meta:
        model = Credit

    amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    observations = factory.Faker('sentence')
    credited_at = factory.LazyFunction(lambda: datetime.now().date())
