-- SQL to create the users table for your portal
CREATE TABLE IF NOT EXISTS users (
  emp_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(32) NOT NULL,
  team VARCHAR(32) NOT NULL,
  must_change_password BOOLEAN DEFAULT false
);
