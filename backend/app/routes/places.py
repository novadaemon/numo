"""Routes for place management."""
from flask import Blueprint, request, jsonify
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Place
from ..http.validation import PlaceSchema
from ..http.pagination import validate_pagination_params, apply_pagination

bp = Blueprint('places', __name__, url_prefix='/places')
schema = PlaceSchema()


@bp.route('', methods=['GET'])
def get_places():
    """Get all places with optional pagination and sorting."""
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
        query = db.query(Place)
        
        # Apply sorting based on sort_field
        if sort_field == 'name':
            order_by = desc(Place.name) if sort_order == 'desc' else Place.name
            query = query.order_by(order_by)
        else:
            # Default to name
            query = query.order_by(Place.name)

        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        query = apply_pagination(query, page, size)
        places = query.all()

        return jsonify({
            'data': [{'id': p.id, 'name': p.name} for p in places],
            'page': page,
            'size': size,
            'total': total
        }), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_place():
    """Create a new place."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        place = Place(**validated_data)
        db.add(place)
        db.commit()
        db.refresh(place)

        return jsonify(schema.dump(place)), 201
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'place name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:place_id>', methods=['GET'])
def get_place(place_id):
    """Get a specific place."""
    db = SessionLocal()
    try:
        place = db.query(Place).filter(Place.id == place_id).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        return jsonify({'id': place.id, 'name': place.name}), 200
    finally:
        db.close()


@bp.route('/<int:place_id>', methods=['PUT'])
def update_place(place_id):
    """Update a place."""
    try:
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        place = db.query(Place).filter(Place.id == place_id).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        for key, value in validated_data.items():
            setattr(place, key, value)
        
        db.commit()
        db.refresh(place)

        return jsonify(schema.dump(place)), 200
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'place name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:place_id>', methods=['DELETE'])
def delete_place(place_id):
    """Delete a place."""
    db = SessionLocal()
    try:
        place = db.query(Place).filter(Place.id == place_id).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        db.delete(place)
        db.commit()

        return '', 204
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
