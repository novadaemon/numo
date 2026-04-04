"""Schema for validating debit data."""
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime


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
        validate=validate.Range(min=1, error="place_id must be a positive integer"),
        error_messages={'required': 'place_id is required'}
    )
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="amount must be greater than 0"),
        error_messages={'required': 'amount is required'}
    )
    concept = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=255, error="concept must be between 1 and 255 characters"),
        error_messages={'required': 'concept is required'}
    )
    debited_at = fields.DateTime(
        allow_none=True,
        format='iso',
        error_messages={'invalid': 'debited_at must be in ISO 8601 format (e.g., 2026-04-04T15:30:00)'}
    )
    observations = fields.Str(
        allow_none=True,
        validate=validate.Length(max=500, error="observations must not exceed 500 characters"),
        load_default=None
    )
    category = fields.Str(dump_only=True)
    place = fields.Str(dump_only=True)

    class Meta:
        fields = ('id', 'category_id', 'place_id', 'amount', 'concept', 'debited_at', 'observations', 'category', 'place')

    def validate_amount(self, value):
        """Validate amount is a valid decimal."""
        if value < 0.01:
            raise ValidationError("Amount must be at least 0.01")
