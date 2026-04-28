"""Schema for validating credit data."""
from marshmallow import Schema, fields, validate, ValidationError


class CreditSchema(Schema):
    """Schema for validating credit (income) creation and updates."""

    id = fields.Int(dump_only=True)
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="amount must be greater than 0"),
        error_messages={'required': 'amount is required'}
    )
    observations = fields.Str(
        allow_none=True,
        validate=validate.Length(max=500, error="observations must not exceed 500 characters"),
        load_default=None
    )
    credited_at = fields.Date(
        required=True,
        format='iso',
        error_messages={'required': 'credited_at is required', 'invalid': 'credited_at must be in ISO 8601 format (e.g., 2026-04-04)'}
    )
    created_at = fields.DateTime(
        dump_only=True,
        format='iso'
    )

    class Meta:
        fields = ('id', 'amount', 'observations', 'credited_at', 'created_at')

    def validate_amount(self, value):
        """Validate amount is a valid decimal."""
        if value < 0.01:
            raise ValidationError("Amount must be at least 0.01")
