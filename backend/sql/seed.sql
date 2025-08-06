-- Eunoia Atlas POC Database Schema
-- This file initializes the database with necessary tables

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS donations(
  tx TEXT PRIMARY KEY,
  data JSONB
); 