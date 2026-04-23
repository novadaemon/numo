"""Routes for concept management."""
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, desc
from marshmallow import ValidationError
import unicodedata
from ..database import SessionLocal
from ..models import Concept
from ..http.validation import ConceptSchema
from ..http.pagination import validate_pagination_params, apply_pagination

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
    """Get all concepts with optional pagination, sorting, or search by name.
    
    Query Parameters:
        q (str, optional): Search query string for concept names (case-insensitive, accent-insensitive partial match).
            When provided, returns a flat array (no pagination).
        page (int, optional): Page number (0-indexed, default 0)
        size (int, optional): Page size (default 10)
        sort_field (str, optional): Field to sort by (default 'name')
        sort_order (str, optional): Sort order 'asc' or 'desc' (default 'asc')
    """
    db = SessionLocal()
    try:
        # Search mode: return flat array for autocomplete/combobox usage
        search_query = request.args.get('q', '').strip()
        if search_query:
            query = db.query(Concept)
            normalized_query = normalize_text(search_query)
            concepts = query.all()
            concepts = [c for c in concepts if normalized_query in normalize_text(c.name)]
            return jsonify([{'id': c.id, 'name': c.name} for c in concepts]), 200

        # Paginated mode
        page = request.args.get('page', type=int)
        size = request.args.get('size', type=int)

        page, size, error = validate_pagination_params(page, size)
        if error:
            return jsonify({'error': error}), 400

        sort_field = request.args.get('sort_field', 'name')
        sort_order = request.args.get('sort_order', 'asc')

        valid_sort_fields = ['name']
        if sort_field not in valid_sort_fields:
            error_msg = 'sort_field must be one of: ' + ', '.join(valid_sort_fields)
            return jsonify({'error': error_msg}), 400

        if sort_order not in ['asc', 'desc']:
            return jsonify({'error': 'sort_order must be either asc or desc'}), 400

        query = db.query(Concept)
        order_by = desc(Concept.name) if sort_order == 'desc' else Concept.name
        query = query.order_by(order_by)

        total = query.count()
        query = apply_pagination(query, page, size)
        concepts = query.all()

        return jsonify({
            'data': [{'id': c.id, 'name': c.name} for c in concepts],
            'page': page,
            'size': size,
            'total': total
        }), 200
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
