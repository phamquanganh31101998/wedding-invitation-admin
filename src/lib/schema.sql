-- Wedding Invitation Admin Schema
-- Run this in your Neon database console

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table for multi-tenant wedding management
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  bride_name VARCHAR(100) NOT NULL,
  groom_name VARCHAR(100) NOT NULL,
  wedding_date DATE NOT NULL,
  venue_name VARCHAR(200) NOT NULL,
  venue_address TEXT NOT NULL,
  venue_map_link TEXT,
  theme_primary_color VARCHAR(7) DEFAULT '#E53E3E',
  theme_secondary_color VARCHAR(7) DEFAULT '#FED7D7',
  is_active BOOLEAN DEFAULT true,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guests table for wedding responses
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  attendance VARCHAR(10) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT guests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  
  -- Check constraint for attendance values
  CONSTRAINT guests_attendance_check CHECK (attendance IN ('yes', 'no', 'maybe'))
);

-- Files table for tenant media (images, music, etc.)
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
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants USING BTREE (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants USING BTREE (slug);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_pkey ON tenants USING BTREE (id);
CREATE INDEX IF NOT EXISTS idx_guests_attendance ON guests USING BTREE (attendance);
CREATE INDEX IF NOT EXISTS idx_guests_submitted_at ON guests USING BTREE (submitted_at);
CREATE INDEX IF NOT EXISTS idx_guests_tenant_id ON guests USING BTREE (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS guests_pkey ON guests USING BTREE (id);
CREATE INDEX IF NOT EXISTS idx_files_tenant_id ON files USING BTREE (tenant_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files USING BTREE (type);