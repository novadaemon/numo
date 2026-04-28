"""
Seeder script for Numo database.
Loads seeding data from YAML files in the seeders/ directory.

Usage:
    python backend/seed.py
"""

import sys
from pathlib import Path
import yaml

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models import Category, Place, Debit, Credit, Concept


def load_yaml_file(filepath: Path) -> dict:
    """Load and parse a YAML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def seed_database():
    """Seed the database with data from YAML files."""
    session = SessionLocal()

    try:
        print("🌱 Starting database seeding from YAML files...\n")

        # Drop all existing tables and create new ones
        print("📊 Dropping existing database tables...")
        from app.database import Base, engine
        Base.metadata.drop_all(bind=engine)
        print("✅ Tables dropped\n")

        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created\n")

        seeders_dir = Path(__file__).parent
        
        if not seeders_dir.exists():
            print(f"❌ Seeders directory not found: {seeders_dir}")
            return

        # Load all YAML files
        print("📁 Loading seeder files...")
        
        categories_file = seeders_dir / 'categories.yml'
        concepts_file = seeders_dir / 'concepts.yml'
        places_file = seeders_dir / 'places.yml'
        debits_file = seeders_dir / 'debits.yml'
        credits_file = seeders_dir / 'credits.yml'

        if not all([categories_file.exists(), concepts_file.exists(),
                    places_file.exists(), debits_file.exists(), 
                    credits_file.exists()]):
            print("❌ One or more seeder files are missing")
            missing = []
            for f in [categories_file, concepts_file, places_file, debits_file, credits_file]:
                if not f.exists():
                    missing.append(f.name)
            print(f"   Missing: {', '.join(missing)}")
            return

        categories_data = load_yaml_file(categories_file)
        concepts_data = load_yaml_file(concepts_file)
        places_data = load_yaml_file(places_file)
        debits_data = load_yaml_file(debits_file)
        credits_data = load_yaml_file(credits_file)

        print("✅ Seeder files loaded\n")

        # Seed categories
        print("📁 Creating categories...")
        categories = []
        for cat_data in categories_data.get('categories', []):
            category = Category(**cat_data)
            session.add(category)
            categories.append(category)
            print(f"   ✓ {cat_data['name']}")

        session.flush()  # Get IDs
        print(f"✅ Created {len(categories)} categories\n")

        # Seed concepts
        print("💡 Creating concepts...")
        concepts = []
        for con_data in concepts_data.get('concepts', []):
            concept = Concept(**con_data)
            session.add(concept)
            concepts.append(concept)
            print(f"   ✓ {con_data['name']}")

        session.flush()  # Get IDs
        print(f"✅ Created {len(concepts)} concepts\n")

        # Seed places
        print("📍 Creating places...")
        places = []
        for place_data in places_data.get('places', []):
            place = Place(**place_data)
            session.add(place)
            places.append(place)
            print(f"   ✓ {place_data['name']}")

        session.flush()  # Get IDs
        print(f"✅ Created {len(places)} places\n")

        # Seed debits
        print("💸 Creating debits (expenses)...")
        debits = []
        for i, debit_data in enumerate(debits_data.get('debits', [])):
            # Create a copy to avoid modifying original
            data = debit_data.copy()
            
            # Handle category index reference
            if 'category_idx' in data:
                cat_idx = data.pop('category_idx')
                data['category_id'] = categories[cat_idx].id if cat_idx < len(categories) else categories[0].id
            
            # Handle place index reference (can be None)
            if 'place_idx' in data:
                place_idx = data.pop('place_idx')
                if place_idx is None:
                    data['place_id'] = None
                elif isinstance(place_idx, int):
                    data['place_id'] = places[place_idx].id if place_idx < len(places) else None
            
            debit = Debit(**data)
            session.add(debit)
            debits.append(debit)
            print(f"   ✓ Gasto #{i + 1}: ${data.get('amount', 0):.2f}")

        session.flush()
        print(f"✅ Created {len(debits)} debits\n")

        # Seed credits
        print("💰 Creating credits (income)...")
        credits = []
        for i, credit_data in enumerate(credits_data.get('credits', [])):
            credit = Credit(**credit_data)
            session.add(credit)
            credits.append(credit)
            print(f"   ✓ Ingreso #{i + 1}: ${credit_data.get('amount', 0):.2f}")

        session.flush()
        print(f"✅ Created {len(credits)} credits\n")

        # Commit all changes
        session.commit()

        print("✅ Database seeding completed successfully!\n")

        # Print summary
        total_categories = session.query(Category).count()
        total_places = session.query(Place).count()
        total_debits = session.query(Debit).count()
        total_credits = session.query(Credit).count()
        total_expenses = sum(d.amount for d in session.query(Debit).all())
        total_income = sum(c.amount for c in session.query(Credit).all())
        balance = total_income - total_expenses

        print(f"📊 Summary:")
        print(f"   Categories: {total_categories}")
        print(f"   Places: {total_places}")
        print(f"   Debits: {total_debits} (Total: ${total_expenses:.2f})")
        print(f"   Credits: {total_credits} (Total: ${total_income:.2f})")
        print(f"   Balance: ${balance:.2f}\n")

    except Exception as e:
        session.rollback()
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        session.close()


if __name__ == '__main__':
    seed_database()



