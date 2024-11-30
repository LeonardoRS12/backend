CREATE DATABASE user_management;

\c user_management;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,                        
    email VARCHAR(255) UNIQUE NOT NULL,          
    password VARCHAR(255) NOT NULL,              
    name VARCHAR(255),                           
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_login
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
EXECUTE FUNCTION update_last_login();

SHOW search_path;

CREATE UNIQUE INDEX unique_email_idx ON users(email);

INSERT INTO users (email, password, name, status)
VALUES 
    ('admin@example.com', '$2b$10$1234567890123456789018', 'Active User', 'active'),
    ('blocked@example.com', '$2b$10$1234567890123456789012', 'Blocked User', 'blocked');
    ('testuser@example.com', '$2b$10$abcdefghijklmnopqrstuvwxy', "Active User", 'active');
