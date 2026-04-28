import pytest
import json
from datetime import datetime, timedelta
from app.models import Credit


class TestCreditsEndpoints:
    """Test suite for credits endpoints."""

    def test_get_all_credits_empty(self, client):
        """Test getting all credits when none exist - paginated response with required dates."""
        from datetime import date
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data
        assert 'page' in data
        assert 'size' in data
        assert 'total' in data
        assert isinstance(data['data'], list)
        assert len(data['data']) == 0
        assert data['page'] == 0
        assert data['size'] == 10
        assert data['total'] == 0

    def test_create_credit_valid(self, client):
        """Test creating a credit with valid data."""
        from datetime import date
        payload = {
            'amount': 1500.00,
            'observations': 'Monthly salary',
            'credited_at': date.today().isoformat(),
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
        from datetime import date
        payload = {'amount': 100.00, 'credited_at': date.today().isoformat()}
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
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_credit_negative_amount(self, client):
        """Test creating a credit with negative amount."""
        from datetime import date
        payload = {'amount': -100.00, 'credited_at': date.today().isoformat()}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_credit_zero_amount(self, client):
        """Test creating a credit with zero amount."""
        from datetime import date
        payload = {'amount': 0, 'credited_at': date.today().isoformat()}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data

    def test_create_credit_string_amount(self, client):
        """Test creating a credit with string amount (should be coerced)."""
        from datetime import date
        payload = {'amount': '250.50', 'credited_at': date.today().isoformat()}
        response = client.post(
            '/credits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['amount'] == 250.50

    def test_create_credit_with_date(self, client):
        """Test creating a credit with custom date."""
        from datetime import date
        today = date.today().isoformat()
        payload = {
            'amount': 1500.00,
            'credited_at': today
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
        assert response.status_code == 422

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


class TestCreditsPaginationEndpoints:
    """Test suite for credits pagination endpoints."""

    def test_get_credits_missing_date_parameters(self, client):
        """Test getting credits without required date parameters."""
        response = client.get('/credits?page=0&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data

    def test_get_credits_missing_from_date(self, client):
        """Test getting credits without from_date."""
        response = client.get('/credits?to_date=2025-07-31&page=0&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data

    def test_get_credits_missing_to_date(self, client):
        """Test getting credits without to_date."""
        response = client.get('/credits?from_date=2025-07-01&page=0&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data

    def test_get_credits_with_pagination_default(self, client, credit_factory):
        """Test getting credits with default pagination (page=0, size=10)."""
        # Create 15 credits
        from datetime import date
        base_date = date(2025, 7, 1)
        for i in range(15):
            credit_factory.create(amount=float(i + 1), credited_at=base_date + timedelta(days=i))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 0
        assert data['size'] == 10
        assert data['total'] == 15
        assert len(data['data']) == 10

    def test_get_credits_with_pagination_page_1(self, client, credit_factory):
        """Test getting credits on page 1."""
        # Create 15 credits
        from datetime import date
        base_date = date(2025, 7, 1)
        for i in range(15):
            credit_factory.create(amount=float(i + 1), credited_at=base_date + timedelta(days=i))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=1&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 1
        assert data['size'] == 10
        assert data['total'] == 15
        assert len(data['data']) == 5  # Only 5 items on page 1

    def test_get_credits_with_size_25(self, client, credit_factory):
        """Test getting credits with size=25."""
        # Create 50 credits
        from datetime import date
        base_date = date(2025, 7, 1)
        for i in range(50):
            credit_factory.create(amount=float(i + 1), credited_at=base_date + timedelta(days=i % 31))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=0&size=25')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 0
        assert data['size'] == 25
        assert data['total'] == 50
        assert len(data['data']) == 25

    def test_get_credits_with_size_50(self, client, credit_factory):
        """Test getting credits with size=50."""
        # Create 100 credits
        from datetime import date
        base_date = date(2025, 7, 1)
        for i in range(100):
            credit_factory.create(amount=float(i + 1), credited_at=base_date + timedelta(days=i % 31))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 8, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=0&size=50')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['size'] == 50
        assert len(data['data']) == 50

    def test_get_credits_with_size_100(self, client, credit_factory):
        """Test getting credits with size=100."""
        # Create 150 credits
        from datetime import date
        base_date = date(2025, 7, 1)
        for i in range(150):
            credit_factory.create(amount=float(i + 1), credited_at=base_date + timedelta(days=i % 31))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 8, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=0&size=100')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['size'] == 100
        assert len(data['data']) == 100

    def test_get_credits_invalid_size(self, client):
        """Test getting credits with invalid size parameter."""
        from datetime import date
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&size=15')  # 15 is not in allowed values
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_credits_invalid_page_negative(self, client):
        """Test getting credits with negative page number."""
        from datetime import date
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=-1')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_credits_invalid_size_too_large(self, client):
        """Test getting credits with size larger than allowed."""
        from datetime import date
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&size=1000')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_credits_with_filter_and_pagination(self, client, credit_factory):
        """Test getting credits with filters and pagination."""
        # Use specific dates to isolate this test from others
        from datetime import datetime, date
        specific_date = date(2025, 7, 15)
        current_month_start = specific_date.replace(day=1)
        current_month_end = specific_date.replace(day=31)
        next_month_start = date(2025, 8, 1)
        
        # Create 20 credits in July 2025
        for i in range(20):
            credited_at = current_month_start + timedelta(days=i)
            credit_factory.create(
                amount=float(i + 1),
                credited_at=credited_at
            )
        
        # Create 10 credits in August 2025
        for i in range(10):
            credited_at = next_month_start + timedelta(days=i)
            credit_factory.create(
                amount=float(i + 1),
                credited_at=credited_at
            )
        
        # Filter by July 2025 only (avoid inclusive range issues)
        from_date = current_month_start.isoformat()
        to_date = current_month_end.isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}&page=0&size=10')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['total'] == 20
        assert data['page'] == 0
        assert len(data['data']) == 10

    def test_get_credits_pagination_structure(self, client, credit_factory):
        """Test that pagination response has correct structure."""
        from datetime import date
        credit_factory.create(amount=100.00, credited_at=date(2025, 7, 15))
        
        from_date = date(2025, 7, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/credits?from_date={from_date}&to_date={to_date}')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Verify structure
        assert isinstance(data, dict)
        assert 'data' in data
        assert 'page' in data
        assert 'size' in data
        assert 'total' in data
        
        # Verify types
        assert isinstance(data['data'], list)
        assert isinstance(data['page'], int)
        assert isinstance(data['size'], int)
        assert isinstance(data['total'], int)
