import pytest
import json
from app.models import Concept


class TestConceptsEndpoints:
    """Test suite for concepts endpoints."""

    def test_get_all_concepts_empty(self, client):
        """Test getting all concepts when none exist."""
        response = client.get('/concepts')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data
        assert len(data['data']) == 0

    def test_get_all_concepts_with_data(self, client, concepts):
        """Test getting all concepts when data exists."""
        response = client.get('/concepts')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data
        assert len(data['data']) == 5

    def test_create_concept_valid(self, client):
        """Test creating a concept with valid data."""
        payload = {'name': 'Savings'}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Savings'
        assert 'id' in data

    def test_create_concept_empty_name(self, client):
        """Test creating a concept with empty name."""
        payload = {'name': ''}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_concept_missing_name(self, client):
        """Test creating a concept without name field."""
        payload = {}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_concept_name_too_long(self, client):
        """Test creating a concept with name exceeding 50 characters."""
        payload = {'name': 'a' * 51}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_concept_invalid_characters(self, client):
        """Test creating a concept with special characters."""
        payload = {'name': 'Concept@Special#Char'}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'id' in data
        assert data['name'] == 'Concept@Special#Char'

    def test_create_concept_duplicate_name(self, client, concept):
        """Test creating a concept with duplicate name."""
        payload = {'name': concept.name}
        response = client.post(
            '/concepts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_get_concept_by_id(self, client, concept):
        """Test getting a concept by ID."""
        response = client.get(f'/concepts/{concept.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == concept.id
        assert data['name'] == concept.name

    def test_get_concept_not_found(self, client):
        """Test getting a non-existent concept."""
        response = client.get('/concepts/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']

    def test_update_concept_valid(self, client, concept):
        """Test updating a concept with valid data."""
        payload = {'name': 'Updated Name'}
        response = client.put(
            f'/concepts/{concept.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Updated Name'
        assert data['id'] == concept.id

    def test_update_concept_empty_name(self, client, concept):
        """Test updating a concept with empty name."""
        payload = {'name': ''}
        response = client.put(
            f'/concepts/{concept.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data

    def test_update_concept_invalid_characters(self, client, concept):
        """Test updating a concept with special characters."""
        payload = {'name': 'Invalid@Char!'}
        response = client.put(
            f'/concepts/{concept.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'id' in data
        assert data['name'] == 'Invalid@Char!'

    def test_update_concept_duplicate_name(self, client, concept):
        """Test updating a concept with duplicate name."""
        # Create another concept first
        response = client.post(
            '/concepts',
            data=json.dumps({'name': 'Unique Name'}),
            content_type='application/json'
        )
        assert response.status_code == 201

        # Try to update first concept with the duplicate name
        payload = {'name': 'Unique Name'}
        response = client.put(
            f'/concepts/{concept.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_update_concept_not_found(self, client):
        """Test updating a non-existent concept."""
        payload = {'name': 'New Name'}
        response = client.put(
            '/concepts/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']

    def test_delete_concept(self, client, concept):
        """Test deleting a concept."""
        response = client.delete(f'/concepts/{concept.id}')
        assert response.status_code == 204

        # Verify concept is deleted
        response = client.get(f'/concepts/{concept.id}')
        assert response.status_code == 404

    def test_delete_concept_not_found(self, client):
        """Test deleting a non-existent concept."""
        response = client.delete('/concepts/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']
