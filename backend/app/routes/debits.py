"""Routes for debit (expense) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Debit, Category, Place
from ..http.validation import DebitSchema
from ..http.pagination import validate_pagination_params, apply_pagination

bp = Blueprint('debits', __name__, url_prefix='/debits')
schema = DebitSchema()


def format_debit(debit):
    """Format a debit record for JSON response."""
    return {
        'id': debit.id,
        'category_id': debit.category_id,
        'category': {
            'id': debit.category.id,
            'name': debit.category.name
        } if debit.category else None,
        'place_id': debit.place_id,
        'place': {
            'id': debit.place.id,
            'name': debit.place.name
        } if debit.place else None,
        'amount': float(debit.amount),
        'created_at': debit.created_at.isoformat(),
        'observations': debit.observations,
    }


@bp.route('', methods=['GET'])
def get_debits():
    """Get all debits, optionally filtered by date range with pagination."""
    db = SessionLocal()
    try:
        # Get pagination parameters
        page = request.args.get('page', type=int)
        size = request.args.get('size', type=int)
        
        page, size, error = validate_pagination_params(page, size)
        if error:
            return jsonify({'error': error}), 400
        
        # Get query parameters for filtering
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id', type=int)
        place_id = request.args.get('place_id', type=int)

        # Validate date range is provided
        if not from_date or not to_date:
            return jsonify({'error': 'from_date and to_date are required parameters'}), 400

        query = db.query(Debit).order_by(desc(Debit.created_at))

        # Apply date filters (required)
        try:
            from_dt = datetime.fromisoformat(from_date)
            query = query.filter(Debit.created_at >= from_dt)
        except ValueError:
            return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        try:
            to_dt = datetime.fromisoformat(to_date)
            query = query.filter(Debit.created_at <= to_dt)
        except ValueError:
            return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400

        # Apply optional filters
        if category_id:
            query = query.filter(Debit.category_id == category_id)

        if place_id:
            query = query.filter(Debit.place_id == place_id)

        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        query = apply_pagination(query, page, size)
        debits = query.all()

        return jsonify({
            'data': [format_debit(d) for d in debits],
            'page': page,
            'size': size,
            'total': total
        }), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_debit():
    """Create a new debit."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        # Verify foreign keys exist
        category = db.query(Category).filter(Category.id == validated_data['category_id']).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        # Verify place exists only if place_id is provided
        if validated_data.get('place_id'):
            place = db.query(Place).filter(Place.id == validated_data['place_id']).first()
            if not place:
                return jsonify({'error': 'place not found'}), 404

        # Create debit with default timestamp if not provided
        if not validated_data.get('created_at'):
            validated_data['created_at'] = datetime.utcnow()

        debit = Debit(**validated_data)
        db.add(debit)
        db.commit()
        db.refresh(debit)

        return jsonify(format_debit(debit)), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:debit_id>', methods=['GET'])
def get_debit(debit_id):
    """Get a specific debit."""
    db = SessionLocal()
    try:
        debit = db.query(Debit).filter(Debit.id == debit_id).first()
        if not debit:
            return jsonify({'error': 'debit not found'}), 404

        return jsonify(format_debit(debit)), 200
    finally:
        db.close()


@bp.route('/<int:debit_id>', methods=['PUT'])
def update_debit(debit_id):
    """Update a debit."""
    try:
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        debit = db.query(Debit).filter(Debit.id == debit_id).first()
        if not debit:
            return jsonify({'error': 'debit not found'}), 404

        # Validate foreign keys if provided
        if 'category_id' in validated_data:
            category = db.query(Category).filter(Category.id == validated_data['category_id']).first()
            if not category:
                return jsonify({'error': 'category not found'}), 404

        if 'place_id' in validated_data:
            place = db.query(Place).filter(Place.id == validated_data['place_id']).first()
            if not place:
                return jsonify({'error': 'place not found'}), 404

        # Update fields
        for key, value in validated_data.items():
            setattr(debit, key, value)

        db.commit()
        db.refresh(debit)

        return jsonify(format_debit(debit)), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:debit_id>', methods=['DELETE'])
def delete_debit(debit_id):
    """Delete a debit."""
    db = SessionLocal()
    try:
        debit = db.query(Debit).filter(Debit.id == debit_id).first()
        if not debit:
            return jsonify({'error': 'debit not found'}), 404

        db.delete(debit)
        db.commit()

        return '', 204
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
