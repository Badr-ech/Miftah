# Database Setup Guide for Miftah Educational Platform

This guide provides instructions for setting up the PostgreSQL database for the Miftah educational platform.

## Prerequisites

- PostgreSQL 13+ installed on your system
- Node.js 18+ and npm for running Prisma commands

## Step 1: Create the database

1. Open your PostgreSQL command line tool or GUI admin tool (pgAdmin, DBeaver, etc.)
2. Run the following commands to create the database:

```sql
CREATE DATABASE miftah;
```

## Step 2: Configure environment variables

1. Update the `.env` file with your PostgreSQL connection details:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/miftah?schema=public"
```

Replace `postgres:postgres` with your PostgreSQL username and password if they're different.

## Step 3: Apply database migrations

Run the following commands in your terminal:

```bash
# Install dependencies if you haven't already
npm install

# Generate Prisma client
npm run db:generate

# Apply database schema
npm run db:push

# Seed the database with initial data
npx prisma db seed
```

## Step 4: Explore your database (optional)

To visually explore and manage your database, run:

```bash
npm run db:studio
```

This opens Prisma Studio in your browser at http://localhost:5555.

## Database Schema Overview

The database includes the following key models:

- **User**: Students, teachers, and administrators
- **Course**: Educational courses offered on the platform
- **CourseMaterial**: Resources like files, videos, and links
- **Assignment**: Tasks assigned to students
- **AssignmentSubmission**: Student submissions for assignments
- **Message**: Communication between users
- **Announcement**: Course-wide announcements
- **CourseEnrollment**: Tracks student enrollment in courses
- **StudentProgress**: Tracks student performance and progress

## Troubleshooting

If you encounter issues:

1. Verify PostgreSQL is running
2. Check your connection details in the `.env` file
3. Ensure you have permissions to create databases and tables
4. Check PostgreSQL logs for any errors
