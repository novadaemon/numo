"""

# Integration Example: How to Use Validation Schemas in Routes

This file shows how to integrate the validation schemas into your API route handlers.

## Before (Current Implementation)

```python
@bp.route('', methods=['POST'])
def create_category():
    data = request.get_json()

    # Manual validation (repetitive, error-prone)
    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    # Process...
```

## After (With Marshmallow)

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.http.validation import CategorySchema
from app.models import Category
from app.database import SessionLocal

bp = Blueprint('categories', __name__, url_prefix='/categories')
schema = CategorySchema()  # Create once, reuse in handlers

@bp.route('', methods=['POST'])
def create_category():
    try:
        # Validate and deserialize
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        # Return validation errors with 400 status
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        category = Category(**validated_data)
        db.add(category)
        db.commit()
        db.refresh(category)
        return jsonify(schema.dump(category)), 201  # Serialize response
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'category name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
```

## Benefits

1. **Consistency**: All endpoints use the same validation approach
2. **Reusability**: Schemas can be used in multiple places
3. **Type Safety**: Automatic type conversion and validation
4. **Maintainability**: Change validation rules in one place
5. **API Clarity**: Clear error messages for API consumers

## Complete Integration Checklist

### Categories

- [ ] Import CategorySchema
- [ ] Create schema instance at module level
- [ ] Replace manual validation in create_category()
- [ ] Replace manual validation in update_category()
- [ ] Use schema.dump() in responses

### Places

- [ ] Import PlaceSchema
- [ ] Create schema instance at module level
- [ ] Replace manual validation in create_place()
- [ ] Replace manual validation in update_place()

### Debits

- [ ] Import DebitSchema
- [ ] Create schema instance at module level
- [ ] Replace manual validation in create_debit()
- [ ] Handle ValidationError for amount validation
- [ ] Use schema.load() for input validation

### Credits

- [ ] Import CreditSchema
- [ ] Create schema instance at module level
- [ ] Replace manual validation in create_credit()
- [ ] Handle ValidationError for amount validation

## Example: Handling Partial Updates

When updating with PUT, use `partial=True` to allow optional fields:

```python
@bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        # partial=True makes all fields optional
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        category = db.query(Category).get(category_id)
        if not category:
            return jsonify({'error': 'category not found'}), 404

        # Update only provided fields
        for key, value in validated_data.items():
            setattr(category, key, value)

        db.commit()
        db.refresh(category)
        return jsonify(schema.dump(category)), 200
    finally:
        db.close()
```

"""
