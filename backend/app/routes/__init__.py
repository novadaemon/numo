"""Routes module for Numo API."""
from .categories import bp as categories_bp
from .places import bp as places_bp
from .debits import bp as debits_bp
from .credits import bp as credits_bp
from .concepts import bp as concepts_bp
from .system import system_bp

blueprints = [categories_bp, places_bp, debits_bp, credits_bp, concepts_bp, system_bp]

__all__ = ['blueprints']
