import pytest
import json
from datetime import datetime
from app.models import Debit


class TestDebitsEndpoints:
    """Test suite for debits endpoints."""

    def test_get_all_debits_empty(self, client):
        """Test getting all debits when none exist."""
        response = client.get('/debits')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_create_debit_valid(self, client, category, place):
        """Test creating a debit with valid data."""
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 50.00,
            'observations': 'Weekly groceries'
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 50.00
        assert data['category']['id'] == category.id
        assert data['place']['id'] == place.id
        assert 'id' in data
        assert 'debited_at' in data

    def test_create_debit_minimal(self, client, category, place):
        """Test creating a debit with minimal required data."""
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 25.50
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 25.50

    def test_create_debit_missing_category_id(self, client, place):
        """Test creating a debit without category_id."""
        payload = {
            'place_id': place.id,
            'amount': 50.00
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'category_id' in data['errors']

    def test_create_debit_without_place_id(self, client, category):
        """Test creating a debit without place_id (place_id is nullable)."""
        payload = {
            'category_id': category.id,
            'amount': 50.00,
            'observations': 'No specific place'
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 50.00
        assert data['place_id'] is None
        assert data['place'] is None

    def test_create_debit_missing_amount(self, client, category, place):
        """Test creating a debit without amount."""
        payload = {
            'category_id': category.id,
            'place_id': place.id
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_debit_negative_amount(self, client, category, place):
        """Test creating a debit with negative amount."""
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': -50.00
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_debit_zero_amount(self, client, category, place):
        """Test creating a debit with zero amount."""
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 0
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data

    def test_create_debit_invalid_category_id(self, client, place):
        """Test creating a debit with non-existent category."""
        payload = {
            'category_id': 9999,
            'place_id': place.id,
            'amount': 50.00
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_create_debit_invalid_place_id(self, client, category):
        """Test creating a debit with non-existent place."""
        payload = {
            'category_id': category.id,
            'place_id': 9999,
            'amount': 50.00
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_create_debit_with_datetime(self, client, category, place):
        """Test creating a debit with custom datetime."""
        now = datetime.now().isoformat()
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 50.00,
            'debited_at': now
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 50.00

    def test_get_debit_by_id(self, client, debit_with_relationships):
        """Test getting a debit by ID."""
        response = client.get(f'/debits/{debit_with_relationships.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == debit_with_relationships.id
        assert data['amount'] == debit_with_relationships.amount

    def test_get_debit_not_found(self, client):
        """Test getting a non-existent debit."""
        response = client.get('/debits/9999')
        assert response.status_code == 404

    def test_update_debit_amount(self, client, debit_with_relationships):
        """Test updating a debit amount."""
        payload = {'amount': 75.50}
        response = client.put(
            f'/debits/{debit_with_relationships.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['amount'] == 75.50

    def test_update_debit_invalid_amount(self, client, debit_with_relationships):
        """Test updating a debit with invalid amount."""
        payload = {'amount': -10.00}
        response = client.put(
            f'/debits/{debit_with_relationships.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_update_debit_not_found(self, client):
        """Test updating a non-existent debit."""
        payload = {'amount': 50.00}
        response = client.put(
            '/debits/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_delete_debit(self, client, debit_with_relationships):
        """Test deleting a debit."""
        response = client.delete(f'/debits/{debit_with_relationships.id}')
        assert response.status_code == 204

    def test_delete_debit_not_found(self, client):
        """Test deleting a non-existent debit."""
        response = client.delete('/debits/9999')
        assert response.status_code == 404
