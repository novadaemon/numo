import pytest
import os
from datetime import date
import base64

# Set test database BEFORE importing app modules
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app import create_app
from app.models import Category, Place
from app.database import Base, engine, SessionLocal
from app.factories import CategoryFactory, PlaceFactory, DebitFactory, CreditFactory, ConceptFactory


class AuthenticatedTestClient:
    """Test client wrapper that automatically includes HTTP Basic Auth headers."""
    
    def __init__(self, test_client, username='admin', password='admin'):
        """Initialize with a Flask test client and credentials."""
        self.test_client = test_client
        # Create Basic Auth header: base64(username:password)
        credentials = f'{username}:{password}'
        self.auth_header = base64.b64encode(credentials.encode()).decode()
    
    def _add_auth_header(self, headers=None):
        """Add Authorization header to request headers if not already present."""
        if headers is None:
            headers = {}
        else:
            headers = dict(headers)
        # Only add auth if not already present (allows overriding)
        if 'Authorization' not in headers:
            headers['Authorization'] = f'Basic {self.auth_header}'
        return headers
    
    def _get_raw_client(self):
        """Get the underlying Flask test client for unauthenticated requests."""
        return self.test_client
    
    def get(self, *args, **kwargs):
        """GET request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.get(*args, **kwargs)
    
    def post(self, *args, **kwargs):
        """POST request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.post(*args, **kwargs)
    
    def put(self, *args, **kwargs):
        """PUT request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.put(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """DELETE request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.delete(*args, **kwargs)
    
    def options(self, *args, **kwargs):
        """OPTIONS request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.options(*args, **kwargs)
    
    def patch(self, *args, **kwargs):
        """PATCH request with auth header."""
        kwargs['headers'] = self._add_auth_header(kwargs.get('headers'))
        return self.test_client.patch(*args, **kwargs)


@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    app = create_app()
    app.config['TESTING'] = True
    
    yield app


@pytest.fixture
def client(app):
    """A test client for the app with automatic authentication."""
    test_client = app.test_client()
    return AuthenticatedTestClient(test_client)


@pytest.fixture
def unauthenticated_client(app):
    """A test client for the app WITHOUT automatic authentication."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's CLI commands."""
    return app.test_cli_runner()


@pytest.fixture(autouse=True)
def db_session(app):
    """Reset database before each test (like Pest)."""
    session = SessionLocal()
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        
        # Recreate all tables
        Base.metadata.create_all(bind=engine)
        
        yield session
        
        # Cleanup after test
        session.rollback()
    finally:
        session.close()


@pytest.fixture
def category(app):
    """Create a test category."""
    session = SessionLocal()
    try:
        category = CategoryFactory.create(name='Food')
        session.add(category)
        session.commit()
        session.refresh(category)
        return category
    finally:
        session.close()


@pytest.fixture
def place(app):
    """Create a test place."""
    session = SessionLocal()
    try:
        place = PlaceFactory.create(name='Supermarket ABC')
        session.add(place)
        session.commit()
        session.refresh(place)
        return place
    finally:
        session.close()


@pytest.fixture
def categories(app):
    """Create multiple test categories."""
    session = SessionLocal()
    try:
        categories = CategoryFactory.create_batch(5)
        for cat in categories:
            session.add(cat)
        session.commit()
        for cat in categories:
            session.refresh(cat)
        return categories
    finally:
        session.close()


@pytest.fixture
def concept(app):
    """Create a test concept."""
    session = SessionLocal()
    try:
        concept = ConceptFactory.create(name='Investment')
        session.add(concept)
        session.commit()
        session.refresh(concept)
        return concept
    finally:
        session.close()


@pytest.fixture
def concepts(app):
    """Create multiple test concepts."""
    session = SessionLocal()
    try:
        concepts = ConceptFactory.create_batch(5)
        for con in concepts:
            session.add(con)
        session.commit()
        for con in concepts:
            session.refresh(con)
        return concepts
    finally:
        session.close()


@pytest.fixture
def debit_with_relationships(app, category, place):
    """Create a test debit with relationships."""
    session = SessionLocal()
    try:
        # Merge the category and place into the session
        category = session.merge(category)
        place = session.merge(place)
        
        debit = DebitFactory.create(
            category=category,
            place=place,
            amount=50.00,
            concept="Test expense",
            expensed_at=date.today()
        )
        session.add(debit)
        session.commit()
        session.refresh(debit)
        return debit
    finally:
        session.close()


@pytest.fixture
def credit(app):
    """Create a test credit."""
    session = SessionLocal()
    try:
        credit = CreditFactory.create(
            amount=1500.00,
            credited_at=date.today()
        )
        session.add(credit)
        session.commit()
        session.refresh(credit)
        return credit
    finally:
        session.close()


@pytest.fixture
def debit_factory(app, db_session):
    """Factory fixture for creating test debits."""
    class Factory:
        def create(self, category=None, category_id=None, place=None, place_id=None, **kwargs):
            # If category_id is provided, fetch the category object
            if category_id and not category:
                category = db_session.query(Category).get(category_id)
            
            # If place_id is provided, fetch the place object
            if place_id and not place:
                place = db_session.query(Place).get(place_id)
            
            # If no place is provided, create one
            if not place:
                place = PlaceFactory.create()
                db_session.add(place)
                db_session.flush()
            
            # If no category is provided, create one  
            if not category:
                category = CategoryFactory.create()
                db_session.add(category)
                db_session.flush()
            
            debit = DebitFactory.create(
                category=category,
                place=place,
                **kwargs
            )
            db_session.add(debit)
            db_session.commit()
            db_session.refresh(debit)
            return debit
    
    return Factory()


@pytest.fixture
def credit_factory(app):
    """Factory fixture for creating test credits."""
    session = SessionLocal()
    
    class Factory:
        def create(self, **kwargs):
            credit = CreditFactory.create(**kwargs)
            session.add(credit)
            session.commit()
            session.refresh(credit)
            return credit
    
    yield Factory()
    session.close()


@pytest.fixture
def category_factory(app):
    """Factory fixture for creating test categories."""
    session = SessionLocal()
    
    class Factory:
        def create(self, **kwargs):
            category = CategoryFactory.create(**kwargs)
            session.add(category)
            session.commit()
            session.refresh(category)
            return category
    
    yield Factory()
    session.close()
