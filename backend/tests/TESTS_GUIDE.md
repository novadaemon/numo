# Testing with pytest-flask

This guide explains how to run the test suite for the Numo API using pytest and pytest-flask.

## Setup

Tests are configured to use `pytest` and `pytest-flask` for testing the Flask application.

### Dependencies

All test dependencies are listed in `requirements-dev.txt`:

- `pytest==7.4.3` - Testing framework
- `pytest-flask==1.3.0` - Flask testing utilities
- `pytest-cov==4.1.0` - Code coverage reporting

## Running Tests

### Run all tests

```bash
pytest
```

### Run tests with verbose output

```bash
pytest -v
```

### Run tests with coverage report

```bash
pytest --cov=app --cov-report=html
```

### Run specific test file

```bash
pytest tests/test_categories.py
```

### Run specific test class

```bash
pytest tests/test_categories.py::TestCategoriesEndpoints
```

### Run specific test case

```bash
pytest tests/test_categories.py::TestCategoriesEndpoints::test_create_category_valid
```

### Run tests matching a pattern

```bash
pytest -k "test_create" -v
```

## Docker

### Run tests in Docker

```bash
docker-compose exec -T backend pytest
```

### Run tests with coverage in Docker

```bash
docker-compose exec -T backend pytest --cov=app --cov-report=term-missing
```

## Test Structure

Tests are organized in the `tests/` directory with the following structure:

- `conftest.py` - Pytest configuration and fixtures
- `test_categories.py` - Categories endpoint tests
- `test_places.py` - Places endpoint tests
- `test_debits.py` - Debits endpoint tests
- `test_credits.py` - Credits endpoint tests

## Fixtures

Common fixtures available in all tests (defined in `conftest.py`):

### Database Fixtures

- `db_session` - Reset database before each test (auto-use)
- `app` - Flask application instance
- `client` - Flask test client for making requests
- `runner` - Flask CLI test runner

### Data Fixtures

- `category` - Single test category
- `place` - Single test place
- `categories` - Multiple test categories (batch of 5)
- `debit_with_relationships` - Test debit with category and place
- `credit` - Single test credit

## Example Test

```python
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
```

## Test Coverage

Current test coverage includes:

### Categories Endpoints

- ✅ GET all categories (empty and with data)
- ✅ POST category (valid and invalid cases)
- ✅ GET category by ID
- ✅ PUT category (valid and invalid)
- ✅ DELETE category

### Places Endpoints

- ✅ GET all places
- ✅ POST place (valid and invalid)
- ✅ GET place by ID
- ✅ PUT place (valid and invalid)
- ✅ DELETE place

### Debits Endpoints

- ✅ GET all debits
- ✅ POST debit (valid, invalid, missing fields)
- ✅ GET debit by ID
- ✅ PUT debit (valid and invalid)
- ✅ DELETE debit
- ✅ Foreign key validation

### Credits Endpoints

- ✅ GET all credits
- ✅ POST credit (valid and invalid)
- ✅ GET credit by ID
- ✅ PUT credit (valid and invalid)
- ✅ DELETE credit

## Validation Testing

All endpoints validate request payloads:

- **Required Fields**: Missing required fields return 400 with error details
- **Type Validation**: Invalid data types are rejected or coerced
- **Range Validation**: Amounts must be positive, names must meet length requirements
- **Format Validation**: Datetimes in ISO 8601 format
- **Foreign Keys**: Category and place IDs are validated against existing records

## Tips

1. **Use `-v` flag** for verbose output to see each test result
2. **Use `-x` flag** to stop on first failure
3. **Use `--lf` flag** to run the last failed tests only
4. **Use `--tb=short`** for shorter traceback output
5. Database is automatically reset between tests (no manual cleanup needed)
6. Tests use temporary SQLite database (in-memory or temporary file)

## Troubleshooting

### Tests fail with "ImportError"

Ensure you're running tests from the `backend/` directory:

```bash
cd backend/
pytest
```

### Database not found

The test database is created automatically by pytest-flask. Check that `conftest.py` is in the `tests/` directory.

### Tests run but database is not cleaned

The `db_session` fixture with `autouse=True` cleans the database before each test. If not working, ensure `conftest.py` is properly configured.
