"""Routes for place management."""
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..database import SessionLocal
from ..models import Place

bp = Blueprint('places', __name__, url_prefix='/places')


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
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    db = SessionLocal()
    try:
        place = Place(name=data['name'])
        db.add(place)
        db.commit()
        db.refresh(place)

        return jsonify({'id': place.id, 'name': place.name}), 201
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
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    db = SessionLocal()
    try:
        place = db.query(Place).filter(Place.id == place_id).first()
        if not place:
            return jsonify({'error': 'place not found'}), 404

        place.name = data['name']
        db.commit()
        db.refresh(place)

        return jsonify({'id': place.id, 'name': place.name}), 200
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

        return jsonify({'message': 'place deleted'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
