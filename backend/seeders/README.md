# Database Seeders

This directory contains YAML seeder files for populating the Numo database with sample data.

## Files

- **categories.yml** - Default expense categories
- **places.yml** - Sample transaction locations
- **debits.yml** - Sample expenses (20 entries for April 2026)
- **credits.yml** - Sample income entries (2 entries for April 2026)

## How to Run

From the project root directory:

```bash
# Install dev dependencies (if not already installed)
pip install -r backend/requirements-dev.txt

# Run the seeder
python backend/seeders/seed.py
```

Or from the backend directory:

```bash
python seeders/seed.py
```

## Seeder Data Summary

- **5 Categories**: Comida, Ocio, Compras, Transporte, Suscripciones
- **7 Places**: Mercado, Restaurante, Centro Comercial, Cine, Farmacia, Gasolina, Tienda Online
- **20 Debits**: Total spending ~$814.23 for April 2026
- **2 Credits**: Total income $3,700.00 for April 2026
- **Net Balance**: +$2,885.77

## YAML Format

### Debits Reference

```yaml
debits:
  - category_idx: 0 # Index in categories.yml
    place_idx: 0 # Index in places.yml (null = no place)
    amount: 15.50
    created_at: 2026-04-02T14:30:00
```

### Credits Reference

```yaml
credits:
  - amount: 2500.00
    created_at: 2026-04-05T09:00:00
```

## Modifying Seeders

1. Edit the YAML files to change amounts, dates, or categories
2. Run `python backend/seed.py` again (the script checks for existing data and skips if found)
3. To reset and re-seed, delete the `data/numo.db` file and run the seeder again
