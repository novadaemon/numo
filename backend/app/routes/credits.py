"""Routes for credit (income) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import desc
from ..database import SessionLocal
from ..models import Credit

bp = Blueprint('credits', __name__, url_prefix='/credits')


def format_credit(credit):
    """Format a credit record for JSON response."""
    return {
        'id': credit.id,
        'amount': float(credit.amount),
        'credited_at': credit.credited_at.isoformat(),
        'observations': credit.observations,
    }


@bp.route('', methods=['GET'])
def get_credits():
    """Get all credits, optionally filtered by date range."""
    db = SessionLocal()
    try:
        # Get query parameters for filtering
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')

        query = db.query(Credit).order_by(desc(Credit.credited_at))

        # Apply filters
        if from_date:
            try:
                from_dt = datetime.fromisoformat(from_date)
                query = query.filter(Credit.credited_at >= from_dt)
            except ValueError:
                return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        if to_date:
            try:
                to_dt = datetime.fromisoformat(to_date)
                query = query.filter(Credit.credited_at <= to_dt)
            except ValueError:
                return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400

        credits = query.all()
        return jsonify([format_credit(c) for c in credits]), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_credit():
    """Create a new credit."""
    data = request.get_json()

    # Validate required fields
    if not data or 'amount' not in data:
        return jsonify({'error': 'amount is required'}), 400

    if data['amount'] <= 0:
        return jsonify({'error': 'amount must be greater than 0'}), 400

    db = SessionLocal()
    try:
        # Create credit
        credited_at = data.get('credited_at')
        if credited_at:
            try:
                credited_at = datetime.fromisoformat(credited_at)
            except (ValueError, TypeError):
                return jsonify({'error': 'invalid credited_at format (use ISO format)'}), 400
        else:
            credited_at = datetime.utcnow()

        credit = Credit(
            amount=data['amount'],
            credited_at=credited_at,
            observations=data.get('observations'),
        )
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
    data = request.get_json()

    db = SessionLocal()
    try:
        credit = db.query(Credit).filter(Credit.id == credit_id).first()
        if not credit:
            return jsonify({'error': 'credit not found'}), 404

        # Update fields if provided
        if 'amount' in data:
            if data['amount'] <= 0:
                return jsonify({'error': 'amount must be greater than 0'}), 400
            credit.amount = data['amount']

        if 'credited_at' in data:
            try:
                credit.credited_at = datetime.fromisoformat(data['credited_at'])
            except (ValueError, TypeError):
                return jsonify({'error': 'invalid credited_at format (use ISO format)'}), 400

        if 'observations' in data:
            credit.observations = data['observations']

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

        return jsonify({'message': 'credit deleted'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
