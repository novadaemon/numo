"""Schema for validating debit data."""
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
from app.models.debit import DebitMethod


def validate_positive_or_none(value):
    """Validator that allows None or positive integers."""
    if value is None:
        return  # Allow None values
    if not isinstance(value, int) or value < 1:
        raise ValidationError("must be a positive integer")


class DebitSchema(Schema):
    """Schema for validating debit (expense) creation and updates."""

    id = fields.Int(dump_only=True)
    category_id = fields.Int(
        required=True,
        validate=validate.Range(min=1, error="category_id must be a positive integer"),
        error_messages={'required': 'category_id is required'}
    )
    place_id = fields.Int(
        required=False,
        allow_none=True,
        validate=validate_positive_or_none,
        load_default=None
    )
    concept = fields.Str(
        allow_none=True,
        validate=validate.Length(max=255, error="concept must not exceed 255 characters"),
        load_default=None
    )
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="amount must be greater than 0"),
        error_messages={'required': 'amount is required'}
    )
    method = fields.Str(
        required=False,
        dump_only=False,
        validate=validate.OneOf(
            [m.value for m in DebitMethod],
            error="method must be one of: debit, credit, cash"
        ),
        load_default='cash'
    )
    observations = fields.Str(
        allow_none=True,
        validate=validate.Length(max=500, error="observations must not exceed 500 characters"),
        load_default=None
    )
    expensed_at = fields.Date(
        required=True,
        format='iso',
        error_messages={'required': 'expensed_at is required', 'invalid': 'expensed_at must be in ISO 8601 format (e.g., 2026-04-04)'}
    )
    created_at = fields.DateTime(
        dump_only=True,
        format='iso'
    )
    category = fields.Str(dump_only=True)
    place = fields.Str(dump_only=True)

    class Meta:
        fields = ('id', 'category_id', 'place_id', 'concept', 'amount', 'method', 'observations', 'category', 'place', 'expensed_at', 'created_at')

    def validate_amount(self, value):
        """Validate amount is a valid decimal."""
        if value < 0.01:
            raise ValidationError("Amount must be at least 0.01")
