"""Routes for debit (expense) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from ..database import SessionLocal
from ..models import Debit, Category, Place

bp = Blueprint('debits', __name__, url_prefix='/debits')


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
    data = request.get_json()

    # Validate required fields
    if not data or not all(k in data for k in ['category_id', 'place_id', 'amount']):
        return jsonify({'error': 'category_id, place_id, and amount are required'}), 400

    if data['amount'] <= 0:
        return jsonify({'error': 'amount must be greater than 0'}), 400

    db = SessionLocal()
    try:
        # Verify foreign keys exist
        category = db.query(Category).filter(Category.id == data['category_id']).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        place = db.query(Place).filter(Place.id == data['place_id']).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        # Create debit
        debited_at = data.get('debited_at')
        if debited_at:
            try:
                debited_at = datetime.fromisoformat(debited_at)
            except (ValueError, TypeError):
                return jsonify({'error': 'invalid debited_at format (use ISO format)'}), 400
        else:
            debited_at = datetime.utcnow()

        debit = Debit(
            category_id=data['category_id'],
            place_id=data['place_id'],
            amount=data['amount'],
            debited_at=debited_at,
            observations=data.get('observations'),
        )
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
    data = request.get_json()

    db = SessionLocal()
    try:
        debit = db.query(Debit).filter(Debit.id == debit_id).first()
        if not debit:
            return jsonify({'error': 'debit not found'}), 404

        # Update fields if provided
        if 'category_id' in data:
            category = db.query(Category).filter(Category.id == data['category_id']).first()
            if not category:
                return jsonify({'error': 'category not found'}), 404
            debit.category_id = data['category_id']

        if 'place_id' in data:
            place = db.query(Place).filter(Place.id == data['place_id']).first()
            if not place:
                return jsonify({'error': 'place not found'}), 404
            debit.place_id = data['place_id']

        if 'amount' in data:
            if data['amount'] <= 0:
                return jsonify({'error': 'amount must be greater than 0'}), 400
            debit.amount = data['amount']

        if 'debited_at' in data:
            try:
                debit.debited_at = datetime.fromisoformat(data['debited_at'])
            except (ValueError, TypeError):
                return jsonify({'error': 'invalid debited_at format (use ISO format)'}), 400

        if 'observations' in data:
            debit.observations = data['observations']

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
