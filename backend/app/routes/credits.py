"""Routes for credit (income) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import desc
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Credit
from ..http.validation import CreditSchema
from ..http.pagination import validate_pagination_params, apply_pagination

bp = Blueprint('credits', __name__, url_prefix='/credits')
schema = CreditSchema()


def format_credit(credit):
    """Format a credit record for JSON response."""
    return {
        'id': credit.id,
        'amount': float(credit.amount),
        'created_at': credit.created_at.isoformat(),
        'observations': credit.observations,
    }


@bp.route('', methods=['GET'])
def get_credits():
    """Get all credits, optionally filtered by date range with pagination."""
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

        # Validate date range is provided
        if not from_date or not to_date:
            return jsonify({'error': 'from_date and to_date are required parameters'}), 400

        query = db.query(Credit).order_by(desc(Credit.created_at))

        # Apply date filters (required)
        try:
            from_dt = datetime.fromisoformat(from_date)
            query = query.filter(Credit.created_at >= from_dt)
        except ValueError:
            return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        try:
            to_dt = datetime.fromisoformat(to_date)
            query = query.filter(Credit.created_at <= to_dt)
        except ValueError:
            return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400

        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        query = apply_pagination(query, page, size)
        credits = query.all()

        return jsonify({
            'data': [format_credit(c) for c in credits],
            'page': page,
            'size': size,
            'total': total
        }), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_credit():
    """Create a new credit."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        # Create credit with default timestamp if not provided
        if not validated_data.get('created_at'):
            validated_data['created_at'] = datetime.utcnow()

        credit = Credit(**validated_data)
        db.add(credit)
        db.commit()
        db.refresh(credit)

        return jsonify(format_credit(credit)), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:credit_id>', methods=['GET'])
def get_credit(credit_id):
    """Get a specific credit."""
    db = SessionLocal()
    try:
        credit = db.query(Credit).filter(Credit.id == credit_id).first()
        if not credit:
            return jsonify({'error': 'credit not found'}), 404

        return jsonify(format_credit(credit)), 200
    finally:
        db.close()


@bp.route('/<int:credit_id>', methods=['PUT'])
def update_credit(credit_id):
    """Update a credit."""
    try:
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    db = SessionLocal()
    try:
        credit = db.query(Credit).filter(Credit.id == credit_id).first()
        if not credit:
            return jsonify({'error': 'credit not found'}), 404

        # Update fields
        for key, value in validated_data.items():
            setattr(credit, key, value)

        db.commit()
        db.refresh(credit)

        return jsonify(format_credit(credit)), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:credit_id>', methods=['DELETE'])
def delete_credit(credit_id):
    """Delete a credit."""
    db = SessionLocal()
    try:
        credit = db.query(Credit).filter(Credit.id == credit_id).first()
        if not credit:
            return jsonify({'error': 'credit not found'}), 404

        db.delete(credit)
        db.commit()

        return '', 204
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
