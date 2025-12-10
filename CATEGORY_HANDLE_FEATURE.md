# Category Handle Feature Implementation

## Overview
Added a `handle` property to the Category table to enable URL-friendly category filtering using handles instead of IDs in search parameters.

## Changes Made

### 1. Database Schema (`lib/supabase.ts`)
- Added `handle: string` field to `Category.Row`, `Category.Insert`, and `Category.Update` types
- Handle is required for insert/update operations
- Handle is stored in lowercase for consistency

### 2. Database Migration (`add-category-handle.sql`)
Run this SQL script in your Supabase SQL Editor to update the database:
```sql
-- Add handle column
ALTER TABLE "Category" ADD COLUMN "handle" TEXT;

-- Generate handles from existing names
UPDATE "Category" SET "handle" = LOWER(REPLACE("name", ' ', '-'));

-- Make handle NOT NULL and UNIQUE
ALTER TABLE "Category" ALTER COLUMN "handle" SET NOT NULL;
ALTER TABLE "Category" ADD CONSTRAINT "Category_handle_key" UNIQUE ("handle");

-- Create index for performance
CREATE INDEX "Category_handle_idx" ON "Category"("handle");
```

### 3. Admin Category Form (`app/admin/categories/CategoryList.tsx`)
- Added `handle` input field to the category form
- Users must now provide a handle when creating/editing categories
- Handle input includes validation hint: "use lowercase, no spaces"
- Form state updated to include handle field

### 4. Admin Category Page (`app/admin/categories/page.tsx`)
- Updated Category interface to include `handle` field
- Updated create/update handlers to accept handle in the data payload

### 5. Category API Routes
- **POST `/api/categories/route.ts`**: 
  - Now requires `name`, `handle`, and `type` fields
  - Automatically converts handle to lowercase
  - Returns 400 error if handle is missing

- **PUT `/api/categories/[id]/route.ts`**:
  - Now requires `name`, `handle`, and `type` fields
  - Automatically converts handle to lowercase
  - Returns 400 error if handle is missing

### 6. Frontend Data Fetching (`app/fetch.tsx`)
- `getCategories()` now returns category handles instead of IDs
- Updated return type: `Array<{ handle: string; name: string }>`
- Categories grouped by type now use handles for filtering

### 7. Product Filtering (`app/components/collection-grid.tsx`)
- Updated `CategoriesList` interface to use `handle` instead of `id`
- `toggleCat()` function now works with handles
- Category checkboxes now use handles as keys and values
- URL query parameters use handles: `?category=electronics&category=christmas`

### 8. Products API (`app/api/products/route.ts` & `app/api/products/[id]/route.ts`)
- Products now return category handles in the `categories` array
- Changed from: `categories: product.categories.map((pc: any) => pc.category.name)`
- Changed to: `categories: product.categories.map((pc: any) => pc.category.handle)`

## Benefits

1. **SEO-Friendly URLs**: Category filters now use readable handles like `?category=electronics` instead of `?category=uuid-string`
2. **Better User Experience**: URLs are more readable and shareable
3. **Stable References**: Handles are more stable than names (name can change, handle should remain)
4. **Type Safety**: Handle field is enforced at the database and TypeScript level

## Migration Steps

1. Run the SQL migration script in Supabase SQL Editor
2. Update all existing categories with appropriate handles through the admin interface
3. Test category filtering on the products page
4. Verify that URL parameters use handles

## Example Usage

### Before:
```
/products?category=c5f9d8a3-1b4e-4f9a-8c7d-2e3f4a5b6c7d
```

### After:
```
/products?category=electronics&category=christmas
```

## Notes

- Handles are automatically converted to lowercase
- Handles must be unique across all categories
- Existing products will automatically use handles once categories are updated
- Admin interface still displays category names, but filtering uses handles
