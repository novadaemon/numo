"""Routes for place management."""
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from ..database import SessionLocal
from ..models import Place
from ..http.validation import PlaceSchema

bp = Blueprint('places', __name__, url_prefix='/places')
schema = PlaceSchema()


@bp.route('', methods=['GET'])
def get_places():
    """Get all places."""
    db = SessionLocal()
    try:
        places = db.query(Place).all()
        return jsonify([
            {'id': p.id, 'name': p.name}
            for p in places
        ]), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_place():
    """Create a new place."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

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
        return jsonify({'errors': err.messages}), 400

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
