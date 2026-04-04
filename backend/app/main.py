"""Main routes blueprint for Numo API."""
from flask import Blueprint, jsonify

bp = Blueprint('main', __name__)


@bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200
