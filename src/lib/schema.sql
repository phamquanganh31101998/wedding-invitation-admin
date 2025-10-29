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
  id VARCHAR(50) PRIMARY KEY,
  bride_name VARCHAR(100) NOT NULL,
  groom_name VARCHAR(100) NOT NULL,
  wedding_date DATE NOT NULL,
  venue_name VARCHAR(200) NOT NULL,
  venue_address TEXT NOT NULL,
  venue_map_link TEXT,
  theme_primary_color VARCHAR(7) DEFAULT '#E53E3E',
  theme_secondary_color VARCHAR(7) DEFAULT '#FED7D7',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RSVPs table for wedding responses
CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  attendance VARCHAR(10) NOT NULL,
  message TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT rsvps_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
  
  -- Check constraint for attendance values
  CONSTRAINT rsvps_attendance_check CHECK (attendance IN ('yes', 'no', 'maybe'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants USING BTREE (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_pkey ON tenants USING BTREE (id);
CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps USING BTREE (attendance);
CREATE INDEX IF NOT EXISTS idx_rsvps_submitted_at ON rsvps USING BTREE (submitted_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_tenant_id ON rsvps USING BTREE (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS rsvps_pkey ON rsvps USING BTREE (id);