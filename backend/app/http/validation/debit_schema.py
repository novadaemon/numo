"""Schema for validating debit data."""
from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
from app.models.debit import DebitMethod


class DebitSchema(Schema):
    """Schema for validating debit (expense) creation and updates."""

    id = fields.Int(dump_only=True)
    category_id = fields.Int(
        required=True,
        validate=validate.Range(min=1, error="category_id must be a positive integer"),
        error_messages={'required': 'category_id is required'}
    )
    place_id = fields.Int(
        required=True,
        allow_none=True,
        validate=validate.Range(min=1, error="place_id must be a positive integer"),
        error_messages={'required': 'place_id is required'}
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
    created_at = fields.DateTime(
        allow_none=True,
        format='iso',
        error_messages={'invalid': 'created_at must be in ISO 8601 format (e.g., 2026-04-04T15:30:00)'}
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
    category = fields.Str(dump_only=True)
    place = fields.Str(dump_only=True)

    class Meta:
        fields = ('id', 'category_id', 'place_id', 'concept', 'amount', 'created_at', 'method', 'observations', 'category', 'place')

    def validate_amount(self, value):
        """Validate amount is a valid decimal."""
        if value < 0.01:
            raise ValidationError("Amount must be at least 0.01")
