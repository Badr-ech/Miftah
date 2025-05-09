# MongoDB Setup for Miftah

This project now uses MongoDB as the database backend. Here's how to set up and work with the MongoDB database:

## Connection String

The MongoDB connection string is configured in your `.env` file:

```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"
```

## Local Development

1. If you have MongoDB installed locally, you can use:
   ```
   DATABASE_URL="mongodb://localhost:27017/miftah"
   ```

2. For MongoDB Atlas (cloud-hosted):
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/miftah"
   ```

## Migrating from PostgreSQL

The project has been migrated from PostgreSQL to MongoDB. Key changes:

1. Updated `schema.prisma` to use MongoDB provider
2. Modified ID fields to use MongoDB's ObjectId format
3. Removed PostgreSQL-specific types and constraints
4. Created MongoDB-compatible seeding scripts

## Working with MongoDB in this Project

### Generate Prisma Client

```bash
npm run db:generate
# or
npx prisma generate
```

### Push Schema Changes

```bash
npm run db:push
# or
npx prisma db push
```

### Seed the Database

```bash
npm run db:seed:mongodb
```

### View Database with Prisma Studio

```bash
npm run db:studio
# or
npx prisma studio
```

## MongoDB Best Practices

1. Use the helper functions in `src/lib/mongodb-helpers.ts` for working with ObjectIds
2. Remember that MongoDB is schemaless by nature, but we're using Prisma's schema enforcement
3. MongoDB performs better with embedded documents than with relations for some cases

## Troubleshooting

If you encounter issues with MongoDB connection:

1. Verify your connection string is correct
2. Ensure network access is configured in MongoDB Atlas (if using cloud)
3. Check that your MongoDB user has the correct permissions
4. Run `npx prisma generate` to ensure your client is up to date
