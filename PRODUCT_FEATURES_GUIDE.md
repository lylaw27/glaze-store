# Product Features Implementation Guide

This document describes the new product features added to the Glaze Store admin dashboard and database.

## Features Overview

### 1. Product Status
Products can now be marked as either **Active** or **Hidden**:
- **Active**: Product is visible on the storefront and can be purchased
- **Hidden**: Product is only visible in the admin dashboard, hidden from customers

### 2. Product Variants
Products can have multiple variant options (e.g., Size, Color, Material):
- Each variant option has a **name** (e.g., "Size")
- Each option has multiple **values** (e.g., "Small", "Medium", "Large")
- Add unlimited variant options per product
- Example use cases:
  - Clothing: Size (S, M, L, XL), Color (Red, Blue, Green)
  - Pottery: Size (Small, Medium, Large), Glaze (Matte, Glossy)

### 3. Product Add-ons
Link related products as add-ons that customers can purchase together:
- Select multiple products as add-ons for the main product
- Add-ons appear on the product detail page
- Example use cases:
  - Shoes → Shoelaces as add-on
  - Mug → Coaster as add-on
  - Vase → Flower arrangement as add-on

## Database Schema

### New Tables

#### ProductVariant
```sql
CREATE TABLE "ProductVariant" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "options" TEXT NOT NULL, -- JSON array
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### ProductAddOn
```sql
CREATE TABLE "ProductAddOn" (
  "id" TEXT PRIMARY KEY,
  "mainProductId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "addOnProductId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Product Table
- Added `status` column: `TEXT DEFAULT 'active' NOT NULL`
- Valid values: 'active' or 'hidden'

## API Changes

### GET /api/products
**Storefront endpoint** - Returns only active products with status='active':
```typescript
// Response includes:
{
  id: string;
  name: string;
  handle: string;
  status: 'active'; // Always active for storefront
  variants: {
    id: string;
    options: [
      { name: "Size", values: ["S", "M", "L"] },
      { name: "Color", values: ["Red", "Blue"] }
    ]
  } | null;
  addOns: [
    {
      id: string;
      addOnProduct: {
        id: string;
        name: string;
        price: number;
        images: string[];
      }
    }
  ];
  // ... other fields
}
```

### GET /api/products/[id]
**Admin endpoint** - Returns product with all statuses:
```typescript
// Response includes variants and addOns as shown above
```

## Admin Dashboard Usage

### Creating a Product

1. **Basic Information**: Name, handle, description, price, stock
2. **Product Images**: Upload multiple images
3. **Categories**: Select from existing categories
4. **Status**: Choose Active or Hidden
5. **Variants**: 
   - Click "Add Variant Option"
   - Enter option name (e.g., "Size")
   - Enter values separated by commas (e.g., "Small, Medium, Large")
   - Add multiple options as needed
6. **Add-ons**:
   - Browse the list of existing products
   - Check the products you want as add-ons
   - Cannot select the product itself as an add-on

### Product List View

The admin product list now shows:
- **Status Badge**: Green (Active) or Gray (Hidden)
- **Features Column**: 
  - Purple badge showing number of variants
  - Orange badge showing number of add-ons

## Migration Instructions

### Step 1: Run the Database Migration

Execute the SQL migration file to add the new tables and columns:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f add-product-features.sql
```

Or use the Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `add-product-features.sql`
3. Execute the query

### Step 2: Update Existing Products

All existing products will default to `status='active'`. If you want to hide any products:

```sql
UPDATE "Product" 
SET "status" = 'hidden' 
WHERE "id" IN ('product-id-1', 'product-id-2');
```

### Step 3: Deploy Code Changes

The following files have been updated:
- `lib/supabase.ts` - Database types
- `types/product.ts` - TypeScript interfaces
- `app/api/products/route.ts` - Storefront API
- `app/api/products/[id]/route.ts` - Product detail API
- `app/admin/products/page.tsx` - Server actions
- `app/admin/products/ProductForm.tsx` - Form component
- `app/admin/products/ProductList.tsx` - List component

## TypeScript Types

### VariantOption Interface
```typescript
interface VariantOption {
  name: string;
  values: string[];
}
```

### ProductVariant Interface
```typescript
interface ProductVariant {
  id: string;
  productId: string;
  options: VariantOption[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ProductAddOn Interface
```typescript
interface ProductAddOn {
  id: string;
  mainProductId: string;
  addOnProductId: string;
  addOnProduct?: Product;
  createdAt: Date;
}
```

### ProductStatus Type
```typescript
type ProductStatus = 'active' | 'hidden';
```

## Storefront Integration

### Product Status Filter
The storefront API automatically filters products:
```typescript
// In /api/products route
.eq("status", "active") // Only active products shown
```

### Displaying Variants
When displaying product variants on the storefront:
```typescript
if (product.variants) {
  product.variants.options.forEach(option => {
    console.log(`${option.name}: ${option.values.join(', ')}`);
    // Size: Small, Medium, Large
    // Color: Red, Blue, Green
  });
}
```

### Displaying Add-ons
When showing add-on products:
```typescript
if (product.addOns && product.addOns.length > 0) {
  product.addOns.forEach(addOn => {
    const addOnProduct = addOn.addOnProduct;
    // Show: name, price, images
  });
}
```

## Best Practices

1. **Product Status**:
   - Use "Hidden" for products that are out of season or temporarily unavailable
   - Use "Hidden" for products still being prepared

2. **Variants**:
   - Keep variant option names consistent (e.g., always "Size" not "Sizes")
   - Use clear, concise value names
   - Order values logically (S, M, L, XL, not L, S, XL, M)

3. **Add-ons**:
   - Only add related products that make sense together
   - Keep add-on prices reasonable relative to main product
   - Ensure add-on products are also set to "Active"

## Troubleshooting

### Products not showing on storefront
1. Check if product status is "Active"
2. Verify stock is greater than 0
3. Check if product has at least one category assigned

### Variants not saving
1. Ensure variant option has both name and values
2. Values should be comma-separated
3. Check browser console for errors

### Add-ons not appearing
1. Verify add-on products exist and are "Active"
2. Check if add-on products have images uploaded
3. Ensure add-on relationship is saved in database

## Future Enhancements

Potential future improvements:
- Variant-specific pricing (e.g., Large size costs more)
- Variant-specific inventory tracking
- Required vs optional add-ons
- Add-on quantity limits
- Variant images (different image per color)
- Bulk product status updates
