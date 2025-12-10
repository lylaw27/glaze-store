# Category Management Feature

## Overview
This feature allows administrators to create, edit, and delete product categories. Each category has a **name** and a **type** property. Categories are now stored in a dedicated database table with proper relationships to products.

## Database Schema

### New Tables:
1. **Category** - Stores all categories
   - `id`: Unique identifier
   - `name`: Category name (unique)
   - `type`: Category type (e.g., "Department", "Festival", "Style")
   - `createdAt`, `updatedAt`: Timestamps

2. **ProductCategory** - Join table for many-to-many relationship
   - `id`: Unique identifier
   - `productId`: Reference to Product
   - `categoryId`: Reference to Category
   - `createdAt`: Timestamp
   - Unique constraint on `(productId, categoryId)` pair

### Changes to Product Model:
- Removed: `categories` field (was JSON string array)
- Added: `categories` relation (array of ProductCategory)

## Features

### Category Management (`/admin/categories`)
- **Create Categories**: Add new categories with name and type
- **Edit Categories**: Update existing category name or type
- **Delete Categories**: Remove categories (only if not used by any products)
- **View by Type**: Categories are grouped by their type for easy management
- **Usage Count**: See how many products use each category

### Product Management (Updated)
- **Category Selection**: When creating/editing products, select from checkboxes grouped by category type
- **Multiple Categories**: Products can have multiple categories
- **Visual Feedback**: Selected categories are highlighted
- **Link to Categories**: Direct link to create categories if none exist

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories with product counts
- `POST /api/categories` - Create a new category
  ```json
  {
    "name": "Electronics",
    "type": "Department"
  }
  ```
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category (fails if in use)

### Products (Updated)
- Now accepts `categoryIds` array instead of comma-separated string
- Automatically manages ProductCategory relationships

## Migration Guide

### For New Installations
1. The database tables are already created
2. Run the seed script to populate default categories:
   ```bash
   npm run dev
   # Navigate to /admin/categories
   # Or use the Supabase dashboard to insert categories directly
   ```

### For Existing Installations
If you have existing products with categories in the old JSON format:

1. Run the migration script:
   ```bash
   npx tsx prisma/migrate-categories.ts
   ```

2. This script will:
   - Extract all unique category names from existing products
   - Create Category records (with type "Uncategorized")
   - Create ProductCategory relationships
   - Preserve existing data

3. After migration, update category types via admin UI:
   - Go to `/admin/categories`
   - Edit each category and set the appropriate type

## Default Category Types

The system comes with example categories:

**Department**
- Arts, Electronics, Furniture, Home & Garden, Pottery, Ceramics, Glassware

**Festival**
- Christmas, Easter, Halloween, Valentine's Day

**Style**
- Modern, Vintage, Rustic, Contemporary

You can add, edit, or delete these as needed.

## Usage Examples

### Creating a Category
1. Navigate to `/admin/categories`
2. Click "Add Category"
3. Enter name (e.g., "Vintage")
4. Enter type (e.g., "Style")
5. Click "Create"

### Assigning Categories to Products
1. Navigate to `/admin/products`
2. Create or edit a product
3. Scroll to "Categories" section
4. Check the categories you want to assign
5. Categories are grouped by type for easy selection
6. Save the product

### Deleting a Category
1. Navigate to `/admin/categories`
2. Find the category you want to delete
3. Click "Delete"
4. If the category is used by products, you'll see an error
5. Remove the category from all products first, then delete

## Technical Details

### Relationships
- **One-to-Many**: Category → ProductCategory
- **One-to-Many**: Product → ProductCategory
- **Many-to-Many**: Product ↔ Category (via ProductCategory)

### Cascade Deletes
- Deleting a Product removes all its ProductCategory relationships
- Deleting a Category removes all its ProductCategory relationships
- Categories in use by products cannot be deleted via API (safety check)

### Data Validation
- Category names must be unique
- Both name and type are required
- Category type can be any string (not enforced by schema)

## Navigation
- Admin sidebar now includes "Categories" link between "Products" and "Orders"
- Products form includes link to `/admin/categories` if no categories exist

## Future Enhancements
- Filter products by category on frontend
- Category hierarchy (parent/child categories)
- Predefined category types (dropdown instead of free text)
- Bulk category operations
- Category images/icons
