"""Flask application factory."""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .database import init_db
from .http.auth import auth


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Get allowed origins from environment variable
    allowed_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    ).split(",")
    allowed_origins = [origin.strip() for origin in allowed_origins]

    # Configure CORS for frontend development
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600,
            "expose_headers": ["Content-Type"]
        }
    })

    # Additional CORS handler for preflight requests
    @app.before_request
    def handle_preflight():
        """Manejo explícito de solicitudes OPTIONS (preflight)."""
        if request.method == "OPTIONS":
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            response.headers.add("Access-Control-Max-Age", "3600")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 200

    # Ensure data directory exists for SQLite
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Import models to ensure they're registered with SQLAlchemy
    # Must import BEFORE init_db() to register models
    from .models import Category, Place, Debit, Credit, Concept  # noqa: F401

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
