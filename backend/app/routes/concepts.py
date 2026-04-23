"""Routes for concept management."""
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from marshmallow import ValidationError
import unicodedata
from ..database import SessionLocal
from ..models import Concept
from ..http.validation import ConceptSchema

bp = Blueprint('concepts', __name__, url_prefix='/concepts')
schema = ConceptSchema()


def normalize_text(text):
    """Remove accents and convert to lowercase for accent-insensitive search."""
    if not text:
        return ''
    # Normalize Unicode to NFD (decomposed form)
    nfd = unicodedata.normalize('NFD', text)
    # Filter out combining characters (accents)
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn').lower()


@bp.route('', methods=['GET'])
def get_concepts():
    """Get all concepts or search by name.
    
    Query Parameters:
        q (str, optional): Search query string for concept names (case-insensitive, accent-insensitive partial match)
    """
    db = SessionLocal()
    try:
        query = db.query(Concept)
        
        # Add search filter if q parameter is provided
        search_query = request.args.get('q', '').strip()
        if search_query:
            normalized_query = normalize_text(search_query)
            # Get all concepts and filter in Python for accent-insensitive search
            concepts = query.all()
            concepts = [c for c in concepts if normalized_query in normalize_text(c.name)]
        else:
            concepts = query.all()
        
        return jsonify([
            {'id': c.id, 'name': c.name}
            for c in concepts
        ]), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_concept():
    """Create a new concept."""
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        concept = Concept(**validated_data)
        db.add(concept)
        db.commit()
        db.refresh(concept)

        return jsonify(schema.dump(concept)), 201
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'concept name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:concept_id>', methods=['GET'])
def get_concept(concept_id):
    """Get a specific concept."""
    db = SessionLocal()
    try:
        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            return jsonify({'error': 'concept not found'}), 404

        return jsonify({'id': concept.id, 'name': concept.name}), 200
    finally:
        db.close()


@bp.route('/<int:concept_id>', methods=['PUT'])
def update_concept(concept_id):
    """Update a concept."""
    try:
        validated_data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 422

    db = SessionLocal()
    try:
        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            return jsonify({'error': 'concept not found'}), 404

        for key, value in validated_data.items():
            setattr(concept, key, value)
        
        db.commit()
        db.refresh(concept)

        return jsonify(schema.dump(concept)), 200
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'concept name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:concept_id>', methods=['DELETE'])
def delete_concept(concept_id):
    """Delete a concept."""
    db = SessionLocal()
    try:
        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            return jsonify({'error': 'concept not found'}), 404

        db.delete(concept)
        db.commit()

        return '', 204
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
