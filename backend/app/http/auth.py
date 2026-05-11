"""Basic Authentication module."""
import os
from flask import jsonify
from flask_httpauth import HTTPBasicAuth

auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    """Verify username and password against environment variables.
    
    Args:
        username: Username provided in the Authorization header
        password: Password provided in the Authorization header
        
    Returns:
        True if credentials are valid, False otherwise
    """
    expected_username = os.getenv('NUMO_USERNAME', 'admin')
    expected_password = os.getenv('NUMO_PASSWORD', 'admin')
    
    if username == expected_username and password == expected_password:
        return True
    return False


@auth.error_handler
def auth_error(status):
    """Handle authentication errors by returning 401 Unauthorized.
    
    Args:
        status: HTTP status code from Flask-HTTPAuth
        
    Returns:
        JSON error response with 401 status code
    """
    return jsonify({'error': 'Unauthorized. Please provide valid credentials.'}), 401
