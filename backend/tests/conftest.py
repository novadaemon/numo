import pytest
import os
import tempfile
from datetime import datetime, timedelta
from app import create_app
from app.models import Category, Place, Debit, Credit
from app.database import Base, engine, SessionLocal
from app.factories import CategoryFactory, PlaceFactory, DebitFactory, CreditFactory


@pytest.fixture(scope='session')
def app():
    """Create application for the tests."""
    # Create a temporary database for tests
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    
    # Set test database URL
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    
    app = create_app()
    app.config['TESTING'] = True
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield app
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """A test runner for the app's CLI commands."""
    return app.test_cli_runner()


@pytest.fixture(autouse=True)
def db_session(app):
    """Reset database before each test."""
    # Clear all tables before each test
    session = SessionLocal()
    try:
        session.query(Debit).delete()
        session.query(Credit).delete()
        session.query(Category).delete()
        session.query(Place).delete()
        session.commit()
        
        yield session
        
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
            debited_at=datetime.now()
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
            credited_at=datetime.now()
        )
        session.add(credit)
        session.commit()
        session.refresh(credit)
        return credit
    finally:
        session.close()
