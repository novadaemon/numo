"""Schema for validating concept data."""
from marshmallow import Schema, fields, validate


class ConceptSchema(Schema):
    """Schema for validating concept creation and updates."""

    id = fields.Int(dump_only=True)
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=50, error="Name must be between 1 and 50 characters"),
        ],
        error_messages={'required': 'Name is required'}
    )

    class Meta:
        fields = ('id', 'name')
