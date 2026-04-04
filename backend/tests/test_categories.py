import pytest
import json
from app.models import Category


class TestCategoriesEndpoints:
    """Test suite for categories endpoints."""

    def test_get_all_categories_empty(self, client):
        """Test getting all categories when none exist."""
        response = client.get('/categories')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_all_categories_with_data(self, client, categories):
        """Test getting all categories when data exists."""
        response = client.get('/categories')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 5

    def test_create_category_valid(self, client):
        """Test creating a category with valid data."""
        payload = {'name': 'Groceries'}
        response = client.post(
            '/categories',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Groceries'
        assert 'id' in data

    def test_create_category_empty_name(self, client):
        """Test creating a category with empty name."""
        payload = {'name': ''}
        response = client.post(
            '/categories',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_category_missing_name(self, client):
        """Test creating a category without name field."""
        payload = {}
        response = client.post(
            '/categories',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_category_name_too_long(self, client):
        """Test creating a category with name exceeding 50 characters."""
        payload = {'name': 'a' * 51}
        response = client.post(
            '/categories',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_create_category_invalid_characters(self, client):
        """Test creating a category with invalid characters."""
        payload = {'name': 'Food & Drinks@Home'}
        response = client.post(
            '/categories',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'name' in data['errors']

    def test_get_category_by_id(self, client, category):
        """Test getting a category by ID."""
        response = client.get(f'/categories/{category.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == category.id
        assert data['name'] == category.name

    def test_get_category_not_found(self, client):
        """Test getting a non-existent category."""
        response = client.get('/categories/9999')
        assert response.status_code == 404

    def test_update_category_valid(self, client, category):
        """Test updating a category with valid data."""
        payload = {'name': 'Food-Groceries'}
        response = client.put(
            f'/categories/{category.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Food-Groceries'

    def test_update_category_partial(self, client, category):
        """Test partial update of a category."""
        original_name = category.name
        payload = {'name': 'Updated Category'}
        response = client.put(
            f'/categories/{category.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Updated Category'

    def test_update_category_invalid(self, client, category):
        """Test updating a category with invalid data."""
        payload = {'name': ''}
        response = client.put(
            f'/categories/{category.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data

    def test_update_category_not_found(self, client):
        """Test updating a non-existent category."""
        payload = {'name': 'Updated'}
        response = client.put(
            '/categories/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_delete_category(self, client, category):
        """Test deleting a category."""
        response = client.delete(f'/categories/{category.id}')
        assert response.status_code == 204

    def test_delete_category_not_found(self, client):
        """Test deleting a non-existent category."""
        response = client.delete('/categories/9999')
        assert response.status_code == 404
