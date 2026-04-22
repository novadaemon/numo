import pytest
import json
from datetime import datetime, timedelta
from app.models import Debit


class TestDebitsEndpoints:
    """Test suite for debits endpoints."""

    def test_get_all_debits_empty(self, client):
        """Test getting all debits when none exist - paginated response with required dates."""
        from datetime import date
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}')
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

    def test_create_debit_valid(self, client, category, place):
        """Test creating a debit with valid data."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 50.00,
            'observations': 'Weekly groceries at the supermarket',
            'expensed_at': date.today().isoformat(),
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
        assert 'expensed_at' in data

    def test_create_debit_minimal(self, client, category, place):
        """Test creating a debit with minimal required data."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 25.50,
            'expensed_at': date.today().isoformat()
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
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'category_id' in data['errors']

    def test_create_debit_missing_place_id(self, client, category):
        """Test creating a debit without place_id should fail (place_id is required)."""
        payload = {
            'category_id': category.id,
            'amount': 50.00,
            'observations': 'No place specified'
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_create_debit_missing_amount(self, client, category, place):
        """Test creating a debit without amount."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'expensed_at': date.today().isoformat()
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_debit_negative_amount(self, client, category, place):
        """Test creating a debit with negative amount."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': -50.00,
            'expensed_at': date.today().isoformat()
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data
        assert 'amount' in data['errors']

    def test_create_debit_zero_amount(self, client, category, place):
        """Test creating a debit with zero amount."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 0,
            'expensed_at': date.today().isoformat()
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 422
        data = json.loads(response.data)
        assert 'errors' in data

    def test_create_debit_invalid_category_id(self, client, place):
        """Test creating a debit with non-existent category."""
        from datetime import date
        payload = {
            'category_id': 9999,
            'place_id': place.id,
            'amount': 50.00,
            'expensed_at': date.today().isoformat()
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_create_debit_invalid_place_id(self, client, category):
        """Test creating a debit with non-existent place."""
        from datetime import date
        payload = {
            'category_id': category.id,
            'place_id': 9999,
            'amount': 50.00,
            'expensed_at': date.today().isoformat()
        }
        response = client.post(
            '/debits',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_create_debit_with_date(self, client, category, place):
        """Test creating a debit with custom date."""
        from datetime import date
        today = date.today().isoformat()
        payload = {
            'category_id': category.id,
            'place_id': place.id,
            'amount': 50.00,
            'expensed_at': today
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
        assert response.status_code == 422

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


class TestDebitsPaginationEndpoints:
    """Test suite for debits pagination endpoints."""

    def test_get_debits_missing_date_parameters(self, client):
        """Test getting debits without required date parameters."""
        response = client.get('/debits?page=0&size=10')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_debits_missing_from_date(self, client):
        """Test getting debits without from_date."""
        response = client.get('/debits?to_date=2025-06-30&page=0&size=10')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_debits_missing_to_date(self, client):
        """Test getting debits without to_date."""
        response = client.get('/debits?from_date=2025-06-01&page=0&size=10')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_get_debits_with_pagination_default(self, client, debit_factory, category):
        """Test getting debits with default pagination (page=0, size=10)."""
        # Create 15 debits
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(15):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i)
            )
        
        # Query with date range
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 0
        assert data['size'] == 10
        assert data['total'] == 15
        assert len(data['data']) == 10

    def test_get_debits_with_pagination_page_1(self, client, debit_factory, category):
        """Test getting debits on page 1."""
        # Create 15 debits
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(15):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i)
            )
        
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=1&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 1
        assert data['size'] == 10
        assert data['total'] == 15
        assert len(data['data']) == 5  # Only 5 items on page 1

    def test_get_debits_with_size_25(self, client, debit_factory, category):
        """Test getting debits with size=25."""
        # Create 50 debits - use same category to avoid unique constraint on name
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(50):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i % 30)
            )
        
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=0&size=25')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['page'] == 0
        assert data['size'] == 25
        assert data['total'] == 50
        assert len(data['data']) == 25

    def test_get_debits_with_size_50(self, client, debit_factory, category):
        """Test getting debits with size=50."""
        # Create 100 debits
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(100):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i % 30)
            )
        
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=0&size=50')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['size'] == 50
        assert len(data['data']) == 50

    def test_get_debits_with_size_100(self, client, debit_factory, category):
        """Test getting debits with size=100."""
        # Create 150 debits
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(150):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i % 30)
            )
        
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 7, 31).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=0&size=100')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['size'] == 100
        assert len(data['data']) == 100

    def test_get_debits_invalid_size(self, client):
        """Test getting debits with invalid size parameter."""
        from datetime import date
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&size=15')  # 15 is not in allowed values
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_debits_invalid_page_negative(self, client):
        """Test getting debits with negative page number."""
        from datetime import date
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=-1')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_debits_invalid_size_too_large(self, client):
        """Test getting debits with size larger than allowed."""
        from datetime import date
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&size=1000')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data or 'errors' in data

    def test_get_debits_with_filter_and_pagination(self, client, debit_factory, category):
        """Test getting debits with filters and pagination."""
        # Use specific dates to isolate this test from others
        from datetime import datetime, date
        specific_date = date(2025, 6, 15)
        current_month_start = specific_date.replace(day=1)
        current_month_end = specific_date.replace(day=30)
        next_month_start = date(2025, 7, 1)
        
        # Create 20 debits in June 2025
        for i in range(20):
            expensed_at = current_month_start + timedelta(days=i)
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=expensed_at
            )
        
        # Create 10 debits in July 2025
        for i in range(10):
            expensed_at = next_month_start + timedelta(days=i)
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=expensed_at
            )
        
        # Filter by June 2025 only (avoid inclusive range issues)
        from_date = current_month_start.isoformat()
        to_date = current_month_end.isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&page=0&size=10')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['total'] == 20
        assert data['page'] == 0
        assert len(data['data']) == 10

    def test_get_debits_with_category_filter_and_pagination(self, client, debit_factory, category, category_factory):
        """Test getting debits filtered by category with pagination."""
        # Create a second category with unique name to avoid constraint failure
        other_category = category_factory.create(name='Transport')
        
        # Create 15 debits in first category
        from datetime import datetime, timedelta, date
        base_date = date(2025, 6, 1)
        for i in range(15):
            debit_factory.create(
                category_id=category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=i)
            )
        
        # Create 10 debits in other category
        for i in range(10):
            debit_factory.create(
                category_id=other_category.id,
                amount=float(i + 1),
                expensed_at=base_date + timedelta(days=15 + i)
            )
        
        # Filter by first category
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}&category_id={category.id}&page=0&size=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['total'] == 15
        assert len(data['data']) == 10

    def test_get_debits_pagination_structure(self, client, debit_factory, category):
        """Test that pagination response has correct structure."""
        from datetime import datetime, date
        debit_factory.create(category_id=category.id, amount=100.00, expensed_at=date(2025, 6, 15))
        
        from_date = date(2025, 6, 1).isoformat()
        to_date = date(2025, 6, 30).isoformat()
        response = client.get(f'/debits?from_date={from_date}&to_date={to_date}')
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
