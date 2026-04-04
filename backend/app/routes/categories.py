"""Routes for category management."""
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..database import SessionLocal
from ..models import Category

bp = Blueprint('categories', __name__, url_prefix='/categories')


@bp.route('', methods=['GET'])
def get_categories():
    """Get all categories."""
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        return jsonify([
            {'id': c.id, 'name': c.name}
            for c in categories
        ]), 200
    finally:
        db.close()


@bp.route('', methods=['POST'])
def create_category():
    """Create a new category."""
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    db = SessionLocal()
    try:
        category = Category(name=data['name'])
        db.add(category)
        db.commit()
        db.refresh(category)

        return jsonify({'id': category.id, 'name': category.name}), 201
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'category name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Get a specific category."""
    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        return jsonify({'id': category.id, 'name': category.name}), 200
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """Update a category."""
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'name is required'}), 400

    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        category.name = data['name']
        db.commit()
        db.refresh(category)

        return jsonify({'id': category.id, 'name': category.name}), 200
    except IntegrityError:
        db.rollback()
        return jsonify({'error': 'category name already exists'}), 409
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category."""
    db = SessionLocal()
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'error': 'category not found'}), 404

        db.delete(category)
        db.commit()

        return jsonify({'message': 'category deleted'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
