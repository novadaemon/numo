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
        'observations': credit.observations,
        'credited_at': credit.credited_at.isoformat(),
    }


@bp.route('', methods=['GET'])
def get_credits():
    """Get all credits, optionally filtered by date range, amount, observations with pagination."""
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
        observations = request.args.get('observations')
        amount_gt = request.args.get('amount_gt', type=float)
        amount_lt = request.args.get('amount_lt', type=float)
        sort_field = request.args.get('sort_field', 'credited_at')
        sort_order = request.args.get('sort_order', 'desc')

        # Validate sort field and order
        valid_sort_fields = ['credited_at', 'amount', 'observations']
        if sort_field not in valid_sort_fields:
            sort_field = 'credited_at'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'

        # Build base query
        query = db.query(Credit)

        # Apply sorting
        if sort_order == 'desc':
            query = query.order_by(desc(getattr(Credit, sort_field)))
        else:
            query = query.order_by(getattr(Credit, sort_field))

        # Apply optional date filters
        if from_date:
            try:
                from_dt = datetime.fromisoformat(from_date).date()
                query = query.filter(Credit.credited_at >= from_dt)
            except ValueError:
                return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        if to_date:
            try:
                to_dt = datetime.fromisoformat(to_date).date()
                query = query.filter(Credit.credited_at <= to_dt)
            except ValueError:
                return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400

        # Apply observations filter (text search)
        if observations:
            query = query.filter(Credit.observations.ilike(f'%{observations}%'))

        # Apply amount filters
        if amount_gt is not None:
            query = query.filter(Credit.amount > amount_gt)
        
        if amount_lt is not None:
            query = query.filter(Credit.amount < amount_lt)

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
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
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
        return jsonify({'errors': err.messages}), 422

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
