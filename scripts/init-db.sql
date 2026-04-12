-- Create SonarQube database and user with proper permissions
CREATE DATABASE sonar;
CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar';

-- Grant permissions on the sonar database
GRANT ALL PRIVILEGES ON DATABASE sonar TO sonar;

-- Connect to sonar database and grant schema permissions
\c sonar;
GRANT ALL ON SCHEMA public TO sonar;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sonar;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sonar;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO sonar;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sonar;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sonar;

-- Ensure sonar user can create databases (required for some SonarQube operations)
ALTER USER sonar CREATEDB;
