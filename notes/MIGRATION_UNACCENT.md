# Enable Diacritic-Insensitive Search

This migration enables the PostgreSQL `unaccent` extension to allow diacritic-insensitive searches. After running this migration, searching for "Tung" will match guests named "Tùng", "Túng", etc.

## How to Run the Migration

### Option 1: Using the Node.js Script (Recommended)

```bash
# Make sure you have your DATABASE_URL set in .env.development.local
node scripts/run-unaccent-migration.js
```

### Option 2: Manually in Neon Console

1. Go to your Neon database console
2. Open the SQL Editor
3. Copy and paste the contents of `src/lib/migrations/enable-unaccent.sql`
4. Execute the SQL

## What This Does

- Enables the `unaccent` PostgreSQL extension
- Creates a helper function `f_unaccent()` for easier use
- Allows searches to ignore diacritics (accents, tildes, etc.)

## Testing

After running the migration, test the search functionality:

1. Create a guest with a name like "Tùng" or "José"
2. Search for "Tung" or "Jose" (without diacritics)
3. The guest should appear in the search results

## Technical Details

The search queries now use:

```sql
unaccent(g.name) ILIKE unaccent('%search_term%')
```

This removes diacritics from both the database column and the search term before comparison.
