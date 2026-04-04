"""Routes for debit (expense) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Debit, Category, Place
from ..http.validation import DebitSchema

bp = Blueprint('debits', __name__, url_prefix='/debits')
schema = DebitSchema()


def format_debit(debit):
    """Format a debit record for JSON response."""
    return {
        'id': debit.id,
        'category_id': debit.category_id,
        'category': debit.category.name if debit.category else None,
        'place_id': debit.place_id,
        'place': debit.place.name if debit.place else None,
        'amount': float(debit.amount),
        'debited_at': debit.debited_at.isoformat(),
        'observations': debit.observations,
    }


@bp.route('', methods=['GET'])
def get_debits():
    """Get all debits, optionally filtered by date range."""
    db = SessionLocal()
    try:
        # Get query parameters for filtering
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id', type=int)
        place_id = request.args.get('place_id', type=int)

        query = db.query(Debit).order_by(desc(Debit.debited_at))

        # Apply filters
        if from_date:
            try:
                from_dt = datetime.fromisoformat(from_date)
                query = query.filter(Debit.debited_at >= from_dt)
            except ValueError:
                return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        if to_date:
            try:
                to_dt = datetime.fromisoformat(to_date)
                query = query.filter(Debit.debited_at <= to_dt)
            except ValueError:
                return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400

        if category_id:
            query = query.filter(Debit.category_id == category_id)

        if place_id:
            query = query.filter(Debit.place_id == place_id)

        debits = query.all()
        return jsonify([format_debit(d) for d in debits]), 200
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

        place = db.query(Place).filter(Place.id == validated_data['place_id']).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        # Create debit with default timestamp if not provided
        if not validated_data.get('debited_at'):
            validated_data['debited_at'] = datetime.utcnow()

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

        return jsonify({'message': 'debit deleted'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
