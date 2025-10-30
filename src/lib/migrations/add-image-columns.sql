-- Migration: Create files table for tenant media
-- Run this in your Neon database console if you have existing data

-- Create files table if it doesn't exist
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  name TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT files_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_tenant_id ON files USING BTREE (tenant_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files USING BTREE (type);

-- If you have existing tenant_images table, migrate data to files table
-- Uncomment and run these lines if needed:
-- INSERT INTO files (tenant_id, type, url, name, display_order, created_at)
-- SELECT tenant_id, image_type, image_url, alt_text, display_order, created_at
-- FROM tenant_images;
-- 
-- DROP TABLE IF EXISTS tenant_images;