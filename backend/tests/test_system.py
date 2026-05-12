import base64
import json
import os
from pathlib import Path


class TestSystemEndpoints:
    """Test suite for system endpoints."""

    def _auth_header(self, username=None, password=None):
        username = username or os.getenv("NUMO_USERNAME", "admin")
        password = password or os.getenv("NUMO_PASSWORD", "admin")
        token = base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("utf-8")
        return {"Authorization": f"Basic {token}"}

    def test_verify_auth_options_without_auth(self, unauthenticated_client):
        """OPTIONS /auth/verify should be allowed without credentials (CORS preflight)."""
        response = unauthenticated_client.options("/auth/verify")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == {}

    def test_verify_auth_get_without_auth(self, unauthenticated_client):
        """GET /auth/verify should require credentials."""
        response = unauthenticated_client.get("/auth/verify")
        assert response.status_code == 401

    def test_verify_auth_get_with_valid_auth(self, client):
        """GET /auth/verify should return success with valid credentials."""
        response = client.get("/auth/verify", headers=self._auth_header())
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["authenticated"] is True
        assert data["message"] == "Credentials verified"

    def test_verify_auth_get_with_invalid_auth(self, client):
        """GET /auth/verify should reject invalid credentials."""
        response = client.get(
            "/auth/verify",
            headers=self._auth_header(username="invalid", password="invalid"),
        )
        assert response.status_code == 401

    def test_version_reads_repo_version_file(self, client):
        """GET /version should return the value from the repository .version file, or a default version."""
        version_path = Path(__file__).parent.parent / ".version"
        
        # Try to read version from file, fallback to environment variable or default
        if version_path.exists():
            expected_version = version_path.read_text(encoding="utf-8").strip()
        else:
            # In Docker containers, .version may not be available
            expected_version = "develop"

        response = client.get("/version")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["version"] == expected_version
