"""Schema for validating category data."""
from marshmallow import Schema, fields, validate, ValidationError


class CategorySchema(Schema):
    """Schema for validating category creation and updates."""

    id = fields.Int(dump_only=True)
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=50, error="Name must be between 1 and 50 characters"),
            validate.Regexp(
                r'^[a-zA-Z0-9\s\-_]+$',
                error="Name can only contain letters, numbers, spaces, hyphens, and underscores"
            )
        ],
        error_messages={'required': 'Name is required'}
    )

    class Meta:
        fields = ('id', 'name')
