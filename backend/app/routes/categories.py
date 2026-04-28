"""Routes for category management."""
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Category
from ..http.validation import CategorySchema
from ..http.pagination import validate_pagination_params, apply_pagination

bp = Blueprint('categories', __name__, url_prefix='/categories')
schema = CategorySchema()


@bp.route('', methods=['GET'])
def get_categories():
    """Get all categories with optional pagination and sorting."""
    db = SessionLocal()
    try:
        # Get pagination parameters
        page = request.args.get('page', type=int)
        size = request.args.get('size', type=int)
        
        page, size, error = validate_pagination_params(page, size)
        if error:
            return jsonify({'error': error}), 400
        
        # Get sorting parameters
        sort_field = request.args.get('sort_field', 'name')
        sort_order = request.args.get('sort_order', 'asc')

        # Validate sort parameters
        valid_sort_fields = ['name']
        if sort_field not in valid_sort_fields:
            error_msg = 'sort_field must be one of: ' + ', '.join(valid_sort_fields)
            return jsonify({'error': error_msg}), 400
        
        if sort_order not in ['asc', 'desc']:
            return jsonify({'error': 'sort_order must be either asc or desc'}), 400

        # Build query with sorting
        query = db.query(Category)
        
        # Apply sorting based on sort_field
        if sort_field == 'name':
            order_by = desc(Category.name) if sort_order == 'desc' else Category.name
            query = query.order_by(order_by)
        else:
            # Default to name
            query = query.order_by(Category.name)

        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        query = apply_pagination(query, page, size)
        categories = query.all()

        return jsonify({
            'data': [{'id': c.id, 'name': c.name} for c in categories],
            'page': page,
            'size': size,
            'total': total
        }), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_category():
    """Create a new category."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        category = Category(**validated_data)
        db.add(category)
        db.commit()
        db.refresh(category)

        return jsonify(schema.dump(category)), 201
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'category name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get a specific category."""
    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        return jsonify({'id': category.id, 'name': category.name}), 200
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """Update a category."""
    try:
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        for key, value in validated_data.items():
            setattr(category, key, value)
        
        db.commit()
        db.refresh(category)

        return jsonify(schema.dump(category)), 200
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'category name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category."""
    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        db.delete(category)
        db.commit()

        return '', 204
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
