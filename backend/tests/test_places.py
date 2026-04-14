import pytest
import json
from app.models import Place


class TestPlacesEndpoints:
    """Test suite for places endpoints."""

    def test_get_all_places_empty(self, client):
        """Test getting all places when none exist."""
        response = client.get('/places')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_create_place_valid(self, client):
        """Test creating a place with valid data."""
        payload = {'name': 'Supermarket ABC'}
        response = client.post(
            '/places',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Supermarket ABC'
        assert 'id' in data

    def test_create_place_empty_name(self, client):
        """Test creating a place with empty name."""
        payload = {'name': ''}
        response = client.post(
            '/places',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_place_missing_name(self, client):
        """Test creating a place without name field."""
        payload = {}
        response = client.post(
            '/places',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_place_name_too_long(self, client):
        """Test creating a place with name exceeding 100 characters."""
        payload = {'name': 'a' * 101}
        response = client.post(
            '/places',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_place_special_characters_allowed(self, client):
        """Test that places can have special characters."""
        payload = {'name': "John's Coffee Shop & Bakery"}
        response = client.post(
            '/places',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == "John's Coffee Shop & Bakery"

    def test_get_place_by_id(self, client, place):
        """Test getting a place by ID."""
        response = client.get(f'/places/{place.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == place.id
        assert data['name'] == place.name

    def test_get_place_not_found(self, client):
        """Test getting a non-existent place."""
        response = client.get('/places/9999')
        assert response.status_code == 404

    def test_update_place_valid(self, client, place):
        """Test updating a place with valid data."""
        payload = {'name': 'Updated Supermarket'}
        response = client.put(
            f'/places/{place.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Updated Supermarket'

    def test_update_place_invalid(self, client, place):
        """Test updating a place with invalid data."""
        payload = {'name': ''}
        response = client.put(
            f'/places/{place.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data

    def test_update_place_not_found(self, client):
        """Test updating a non-existent place."""
        payload = {'name': 'Updated'}
        response = client.put(
            '/places/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_delete_place(self, client, place):
        """Test deleting a place."""
        response = client.delete(f'/places/{place.id}')
        assert response.status_code == 204

    def test_delete_place_not_found(self, client):
        """Test deleting a non-existent place."""
        response = client.delete('/places/9999')
        assert response.status_code == 404
