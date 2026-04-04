import pytest
import json
from datetime import datetime
from app.models import Credit


class TestCreditsEndpoints:
    """Test suite for credits endpoints."""

    def test_get_all_credits_empty(self, client):
        """Test getting all credits when none exist."""
        response = client.get('/credits')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_create_credit_valid(self, client):
        """Test creating a credit with valid data."""
        payload = {
            'amount': 1500.00,
            'observations': 'Monthly salary'
        }
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 1500.00
        assert data['observations'] == 'Monthly salary'
        assert 'id' in data
        assert 'credited_at' in data

    def test_create_credit_minimal(self, client):
        """Test creating a credit with minimal required data."""
        payload = {'amount': 100.00}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 100.00

    def test_create_credit_missing_amount(self, client):
        """Test creating a credit without amount."""
        payload = {}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_credit_negative_amount(self, client):
        """Test creating a credit with negative amount."""
        payload = {'amount': -100.00}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_credit_zero_amount(self, client):
        """Test creating a credit with zero amount."""
        payload = {'amount': 0}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'errors' in data

    def test_create_credit_string_amount(self, client):
        """Test creating a credit with string amount (should be coerced)."""
        payload = {'amount': '250.50'}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 250.50

    def test_create_credit_with_datetime(self, client):
        """Test creating a credit with custom datetime."""
        now = datetime.now().isoformat()
        payload = {
            'amount': 1500.00,
            'credited_at': now
        }
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 1500.00

    def test_get_credit_by_id(self, client, credit):
        """Test getting a credit by ID."""
        response = client.get(f'/credits/{credit.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == credit.id
        assert data['amount'] == credit.amount

    def test_get_credit_not_found(self, client):
        """Test getting a non-existent credit."""
        response = client.get('/credits/9999')
        assert response.status_code == 404

    def test_update_credit_amount(self, client, credit):
        """Test updating a credit amount."""
        payload = {'amount': 2000.00}
        response = client.put(
            f'/credits/{credit.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['amount'] == 2000.00

    def test_update_credit_observations(self, client, credit):
        """Test updating credit observations."""
        payload = {'observations': 'Bonus payment'}
        response = client.put(
            f'/credits/{credit.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['observations'] == 'Bonus payment'

    def test_update_credit_invalid_amount(self, client, credit):
        """Test updating a credit with invalid amount."""
        payload = {'amount': -50.00}
        response = client.put(
            f'/credits/{credit.id}',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_update_credit_not_found(self, client):
        """Test updating a non-existent credit."""
        payload = {'amount': 500.00}
        response = client.put(
            '/credits/9999',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_delete_credit(self, client, credit):
        """Test deleting a credit."""
        response = client.delete(f'/credits/{credit.id}')
        assert response.status_code == 204

    def test_delete_credit_not_found(self, client):
        """Test deleting a non-existent credit."""
        response = client.delete('/credits/9999')
        assert response.status_code == 404
