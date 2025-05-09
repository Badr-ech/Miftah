-- Convert existing material type values to enum format
-- If the existing values are lowercase, we need to convert them to uppercase to match the enum

-- First create a temporary column to store the new values
ALTER TABLE "CourseMaterial" ADD COLUMN "type_new" TEXT;

-- Convert existing values to enum format
UPDATE "CourseMaterial" SET "type_new" = UPPER("type"::text);

-- Drop the old column and rename the new one
ALTER TABLE "CourseMaterial" DROP COLUMN "type";
ALTER TABLE "CourseMaterial" RENAME COLUMN "type_new" TO "type";

-- Create the enum type
CREATE TYPE "MaterialType" AS ENUM ('FILE', 'VIDEO', 'LINK', 'TEXT');

-- Convert the column to use the enum type
ALTER TABLE "CourseMaterial" ALTER COLUMN "type" TYPE "MaterialType" USING "type"::text::"MaterialType";
