# Database Schema Changes

Registra todas las modificaciones en la estructura de la base de datos. Las nuevas entradas se agregan siempre al principio del archivo.

---

**2026-06-03**

```sql
sqlite3 numo.db "
BEGIN;
CREATE TABLE debits_new (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    place_id INTEGER NULL REFERENCES places(id),
    concept TEXT,
    amount REAL NOT NULL,
    method TEXT NOT NULL DEFAULT 'debit',
    observations TEXT,
    expensed_at DATE NOT NULL,
    created_at TIMESTAMP NOT NULL
);
INSERT INTO debits_new SELECT * FROM debits;
DROP TABLE debits;
ALTER TABLE debits_new RENAME TO debits;
COMMIT;
"
```
