-- Enable unaccent extension for diacritic-insensitive search
-- This allows searching for "Tung" to match "Tùng"

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Optional: Create a custom function for case-insensitive, accent-insensitive comparison
-- This can be used in WHERE clauses for better search performance
CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text AS
$func$
SELECT unaccent('unaccent', $1)
$func$ LANGUAGE sql IMMUTABLE;

-- Optional: Create indexes for better search performance on guests table
-- Uncomment these if you want to optimize search performance further
-- CREATE INDEX IF NOT EXISTS idx_guests_name_unaccent ON guests (f_unaccent(name));
-- CREATE INDEX IF NOT EXISTS idx_guests_relationship_unaccent ON guests (f_unaccent(relationship));
