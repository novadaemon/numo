"""Flask application factory."""
import os
from flask import Flask
from .database import init_db


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Ensure data directory exists for SQLite
    os.makedirs('/app/data', exist_ok=True)

    # Import models to ensure they're registered with SQLAlchemy
    # Must import BEFORE init_db() to register models
    from .models import Category, Place, Debit, Credit  # noqa: F401

    # Initialize database
    with app.app_context():
        try:
            init_db()
            print("[DB] Database initialized successfully")
        except Exception as e:
            print(f"[DB] Error initializing database: {e}")
            raise

    # Register main blueprint
    from .main import bp as main_bp
    app.register_blueprint(main_bp)

    # Register API blueprints
    from .routes import blueprints
    for bp in blueprints:
        app.register_blueprint(bp)

    return app
