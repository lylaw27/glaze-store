-- Add handle column to Category table
-- This migration adds a handle field for URL-friendly category filtering

-- Step 1: Add the handle column (nullable first)
ALTER TABLE "Category" 
ADD COLUMN "handle" TEXT;

-- Step 2: Generate handles from existing names (lowercase, replace spaces with dashes)
UPDATE "Category" 
SET "handle" = LOWER(REPLACE("name", ' ', '-'));

-- Step 3: Make handle NOT NULL and UNIQUE
ALTER TABLE "Category" 
ALTER COLUMN "handle" SET NOT NULL;

ALTER TABLE "Category" 
ADD CONSTRAINT "Category_handle_key" UNIQUE ("handle");

-- Step 4: Create an index on handle for better query performance
CREATE INDEX "Category_handle_idx" ON "Category"("handle");
