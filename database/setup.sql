-- Alumni Platform Database Setup
-- Run this in psql or pgAdmin before starting the backend

-- Create database
CREATE DATABASE alumni_db;

-- Connect to the database (run in psql)
-- \c alumni_db

-- The tables will be auto-created by Spring Boot (ddl-auto=update)
-- This script creates an initial admin user (run AFTER first startup)

-- After the app has started at least once and created the schema,
-- insert a default admin user (password = "admin123"):
-- The BCrypt hash below is for "admin123"
INSERT INTO users (
  username, email, password, first_name, last_name,
  role, verification_status, enabled, created_at, updated_at
) VALUES (
  'admin',
  'admin@alumniplatform.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Platform',
  'Admin',
  'ROLE_ADMIN',
  'NOT_SUBMITTED',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify insertion
SELECT id, username, email, role FROM users;
