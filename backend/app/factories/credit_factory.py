"""Factory for generating Credit instances."""
import factory
from ..models import Credit


class CreditFactory(factory.Factory):
    """Factory for creating Credit instances."""

    class Meta:
        model = Credit

    credited_at = factory.Faker('date_time', tzinfo=None)
    amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    observations = factory.Faker('sentence')
