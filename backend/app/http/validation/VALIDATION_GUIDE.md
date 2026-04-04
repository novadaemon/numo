"""
# Validation Schemas Usage Guide

## Overview

The `validation` module provides Marshmallow schemas for validating request payloads for all API endpoints in the Numo application.

## Available Schemas

### CategorySchema
Validates category creation and update requests.

**Fields:**
- `name` (required, str): Category name (1-50 characters, alphanumeric with spaces/hyphens/underscores)

**Example:**
```python
from app.http.validation import CategorySchema

schema = CategorySchema()
try:
    data = schema.load({'name': 'Food'})
    print(data)  # {'name': 'Food'}
except ValidationError as err:
    print(err.messages)  # {'name': ['Name must be between 1 and 50 characters']}
```

### PlaceSchema
Validates place creation and update requests.

**Fields:**
- `name` (required, str): Place name (1-100 characters)

**Example:**
```python
from app.http.validation import PlaceSchema

schema = PlaceSchema()
data = schema.load({'name': 'Trader Joe\'s'})
```

### DebitSchema
Validates debit (expense) creation and update requests.

**Fields:**
- `category_id` (required, int): Reference to existing category (must be > 0)
- `place_id` (required, int): Reference to existing place (must be > 0)
- `amount` (required, float): Expense amount (must be > 0)
- `debited_at` (optional, datetime): Transaction date in ISO 8601 format
- `observations` (optional, str): Notes about the expense (max 500 chars)

**Example:**
```python
from app.http.validation import DebitSchema
from datetime import datetime

schema = DebitSchema()
data = schema.load({
    'category_id': 1,
    'place_id': 1,
    'amount': 45.50,
    'debited_at': '2026-04-04T15:30:00',
    'observations': 'Weekly grocery shopping'
})
```

### CreditSchema
Validates credit (income) creation and update requests.

**Fields:**
- `amount` (required, float): Income amount (must be > 0)
- `credited_at` (optional, datetime): Transaction date in ISO 8601 format
- `observations` (optional, str): Notes about the income (max 500 chars)

**Example:**
```python
from app.http.validation import CreditSchema

schema = CreditSchema()
data = schema.load({
    'amount': 1500.00,
    'credited_at': '2026-04-04T09:00:00',
    'observations': 'Monthly salary'
})
```

## Integration with Flask Routes

### Using Schemas in Route Handlers

```python
from flask import Blueprint, request, jsonify
from app.http.validation import CategorySchema
from marshmallow import ValidationError

bp = Blueprint('categories', __name__)
schema = CategorySchema()

@bp.route('/categories', methods=['POST'])
def create_category():
    try:
        # Validate and load data
        validated_data = schema.load(request.get_json())
        
        # Process validated data
        # ... create category ...
        
        return jsonify(validated_data), 201
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
```

### Common Patterns

**Validation on POST (Create):**
```python
@bp.route('', methods=['POST'])
def create_resource():
    try:
        validated_data = schema.load(request.get_json())
        # Create resource with validated_data
        return jsonify(result), 201
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
```

**Validation on PUT (Update):**
```python
@bp.route('/<int:resource_id>', methods=['PUT'])
def update_resource(resource_id):
    try:
        # For updates, you might use partial=True
        validated_data = schema.load(request.get_json(), partial=True)
        # Update resource with validated_data
        return jsonify(result), 200
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
```

## Schema Methods

### `load(data, partial=False)`
- Validates and deserializes data
- `partial=True` makes all fields optional (useful for PATCH/PUT)
- Raises `ValidationError` if validation fails

### `dump(obj)`
- Serializes an object to a dictionary
- Used in responses

### `loads(json_string)`
- Deserializes JSON string

### `dumps(obj)`
- Serializes object to JSON string

## Field Validators

### Built-in Validators Used

- `validate.Length(min, max)` - String length validation
- `validate.Range(min, max)` - Numeric range validation
- `validate.Regexp(pattern)` - Regular expression matching
- `validate.OneOf(choices)` - Value must be one of specified options

### Custom Validation

Add methods with name `validate_<field_name>`:

```python
class CustomSchema(Schema):
    amount = fields.Float()
    
    def validate_amount(self, value):
        if value % 0.05 != 0:  # Only accept multiples of 0.05
            raise ValidationError("Amount must be multiple of 0.05")
```

## Error Handling

Marshmallow's `ValidationError` contains detailed error messages:

```python
from marshmallow import ValidationError

try:
    schema.load({'name': 'x' * 100})  # Too long
except ValidationError as err:
    print(err.messages)
    # Output: {'name': ['Name must be between 1 and 50 characters']}
```

## Best Practices

1. **Validate at entry point** - Validate request data as soon as it enters the application
2. **Reuse schemas** - Create schema instances at module level, not in every request
3. **Use partial=True for updates** - When updating, allow partial data
4. **Type consistency** - Marshmallow automatically converts types (string "45.5" → float 45.5)
5. **Clear error messages** - Provide helpful validation error messages for API consumers

## Example: Complete Integration

```python
from flask import Blueprint, request, jsonify
from app.http.validation import DebitSchema
from app.models import Debit, Category, Place
from app.database import SessionLocal
from marshmallow import ValidationError

bp = Blueprint('debits', __name__, url_prefix='/debits')
schema = DebitSchema()

@bp.route('', methods=['POST'])
def create_debit():
    try:
        # Validate request data
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    db = SessionLocal()
    try:
        # Verify foreign keys
        if not db.query(Category).get(validated_data['category_id']):
            return jsonify({'error': 'category_id not found'}), 404
        
        if not db.query(Place).get(validated_data['place_id']):
            return jsonify({'error': 'place_id not found'}), 404
        
        # Create debit with validated data
        debit = Debit(**validated_data)
        db.add(debit)
        db.commit()
        db.refresh(debit)
        
        return jsonify(schema.dump(debit)), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
```
"""
