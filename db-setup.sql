-- Initial PostgreSQL setup script for Miftah Educational Platform

-- Create the database (run this as postgres superuser)
CREATE DATABASE miftah;

-- Connect to the database (after running the CREATE DATABASE command)
\c miftah

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: The actual schema will be created and managed by Prisma
-- This is just to ensure the database exists with the proper extensions

-- Optionally, create a dedicated database user (more secure than using postgres user)
-- CREATE USER miftah_user WITH ENCRYPTED PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE miftah TO miftah_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO miftah_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO miftah_user;

-- After creating the user, update your .env file with the new credentials
