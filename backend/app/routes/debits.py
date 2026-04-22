"""Routes for debit (expense) management."""
from flask import Blueprint, request, jsonify
from datetime import datetime
import json
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
        'concept': debit.concept,
        'method': debit.method.value,
        'amount': float(debit.amount),
        'observations': debit.observations,
        'expensed_at': debit.expensed_at.isoformat(),
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
        
        # Validate that date range parameters are provided
        if not from_date or not to_date:
            return jsonify({'error': 'from_date and to_date are required parameters'}), 400
        
        category_id = request.args.get('category_id', type=int)
        category_ids_param = request.args.get('category_ids')  # JSON array
        place_id = request.args.get('place_id', type=int)
        place_ids_param = request.args.get('place_ids')  # JSON array
        concept = request.args.get('concept')
        method = request.args.get('method')
        method_values_param = request.args.get('method_values')  # JSON array
        amount_gt = request.args.get('amount_gt', type=float)
        amount_lt = request.args.get('amount_lt', type=float)
        sort_field = request.args.get('sort_field', 'expensed_at')
        sort_order = request.args.get('sort_order', 'desc')

        # Parse JSON parameters for multiple values
        category_ids = None
        place_ids = None
        method_values = None
        
        if category_ids_param:
            try:
                category_ids = json.loads(category_ids_param)
                if not isinstance(category_ids, list):
                    return jsonify({'error': 'category_ids must be a JSON array'}), 400
            except json.JSONDecodeError:
                return jsonify({'error': 'invalid category_ids JSON format'}), 400
        
        if place_ids_param:
            try:
                place_ids = json.loads(place_ids_param)
                if not isinstance(place_ids, list):
                    return jsonify({'error': 'place_ids must be a JSON array'}), 400
            except json.JSONDecodeError:
                return jsonify({'error': 'invalid place_ids JSON format'}), 400
        
        if method_values_param:
            try:
                method_values = json.loads(method_values_param)
                if not isinstance(method_values, list):
                    return jsonify({'error': 'method_values must be a JSON array'}), 400
            except json.JSONDecodeError:
                return jsonify({'error': 'invalid method_values JSON format'}), 400

        # Validate sort parameters
        valid_sort_fields = ['expensed_at', 'category', 'place', 'amount', 'concept', 'method']
        if sort_field not in valid_sort_fields:
            error_msg = 'sort_field must be one of: ' + ', '.join(valid_sort_fields)
            return jsonify({'error': error_msg}), 400
        
        if sort_order not in ['asc', 'desc']:
            return jsonify({'error': 'sort_order must be either asc or desc'}), 400

        # Build query with sorting
        query = db.query(Debit)
        
        # Apply required date filters  
        try:
            from_dt = datetime.fromisoformat(from_date).date()
            query = query.filter(Debit.expensed_at >= from_dt)
        except ValueError:
            return jsonify({'error': 'invalid from_date format (use ISO format)'}), 400

        try:
            to_dt = datetime.fromisoformat(to_date).date()
            query = query.filter(Debit.expensed_at <= to_dt)
        except ValueError:
            return jsonify({'error': 'invalid to_date format (use ISO format)'}), 400
        
        # Apply optional filters
        if category_ids:
            query = query.filter(Debit.category_id.in_(category_ids))
        elif category_id:
            query = query.filter(Debit.category_id == category_id)

        if place_ids:
            query = query.filter(Debit.place_id.in_(place_ids))
        elif place_id:
            query = query.filter(Debit.place_id == place_id)

        if concept:
            query = query.filter(Debit.concept.ilike(f'%{concept}%'))

        if method_values:
            # Validate all methods are valid enum values
            valid_methods = ['debit', 'credit', 'cash']
            for m in method_values:
                if m not in valid_methods:
                    return jsonify({'error': f'method must be one of: {", ".join(valid_methods)}'}), 400
            query = query.filter(Debit.method.in_(method_values))
        elif method:
            # Validate method is one of the enum values
            valid_methods = ['debit', 'credit', 'cash']
            if method not in valid_methods:
                return jsonify({'error': f'method must be one of: {", ".join(valid_methods)}'}), 400
            query = query.filter(Debit.method == method)

        if amount_gt is not None:
            if amount_gt <= 0:
                return jsonify({'error': 'amount_gt must be greater than 0'}), 400
            query = query.filter(Debit.amount > amount_gt)

        if amount_lt is not None:
            if amount_lt <= 0:
                return jsonify({'error': 'amount_lt must be greater than 0'}), 400
            query = query.filter(Debit.amount < amount_lt)

        # Apply joins and sorting based on sort_field
        if sort_field == 'expensed_at':
            order_by = desc(Debit.expensed_at) if sort_order == 'desc' else Debit.expensed_at
            query = query.order_by(order_by)
        elif sort_field == 'category':
            query = query.join(Category, Debit.category_id == Category.id)
            order_by = desc(Category.name) if sort_order == 'desc' else Category.name
            query = query.order_by(order_by)
        elif sort_field == 'place':
            query = query.outerjoin(Place, Debit.place_id == Place.id)
            order_by = desc(Place.name) if sort_order == 'desc' else Place.name
            query = query.order_by(order_by)
        elif sort_field == 'amount':
            order_by = desc(Debit.amount) if sort_order == 'desc' else Debit.amount
            query = query.order_by(order_by)
        elif sort_field == 'concept':
            order_by = desc(Debit.concept) if sort_order == 'desc' else Debit.concept
            query = query.order_by(order_by)
        elif sort_field == 'method':
            order_by = desc(Debit.method) if sort_order == 'desc' else Debit.method
            query = query.order_by(order_by)
        else:
            # Default to expensed_at if invalid field
            query = query.order_by(desc(Debit.expensed_at))

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
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        # Verify foreign keys exist
        category = db.query(Category).filter(Category.id == validated_data['category_id']).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        # Verify place exists (place_id is required)
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
        return jsonify({'errors': err.messages}), 422

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
