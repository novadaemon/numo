"""Schema for validating place data."""
from marshmallow import Schema, fields, validate


class PlaceSchema(Schema):
    """Schema for validating place creation and updates."""

    id = fields.Int(dump_only=True)
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=100, error="Name must be between 1 and 100 characters"),
        ],
        error_messages={'required': 'Name is required'}
    )

    class Meta:
        fields = ('id', 'name')
