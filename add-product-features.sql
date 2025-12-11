-- Add Product Status, Variants, and Add-ons Features
-- This migration adds:
-- 1. Product status (active/hidden)
-- 2. Product variants with options and values
-- 3. Product add-ons relationship

-- ============================================
-- PART 1: Add Product Status
-- ============================================

-- Add status column to Product table
ALTER TABLE "Product" 
ADD COLUMN "status" TEXT DEFAULT 'active' NOT NULL;

-- Add constraint to ensure only valid statuses
ALTER TABLE "Product"
ADD CONSTRAINT "Product_status_check" CHECK ("status" IN ('active', 'hidden'));

-- Create index for better query performance on status
CREATE INDEX "Product_status_idx" ON "Product"("status");


-- ============================================
-- PART 2: Product Variants
-- ============================================

-- Create ProductVariant table for variant options
CREATE TABLE "ProductVariant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL,
  "options" TEXT NOT NULL, -- JSON: [{"name": "Size", "values": ["S", "M", "L"]}, {"name": "Color", "values": ["Red", "Blue"]}]
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductVariant_productId_fkey" 
    FOREIGN KEY ("productId") 
    REFERENCES "Product"("id") 
    ON DELETE CASCADE
);

-- Create unique constraint - one variant config per product
CREATE UNIQUE INDEX "ProductVariant_productId_key" ON "ProductVariant"("productId");

-- Create index for better query performance
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");


-- ============================================
-- PART 3: Product Add-ons
-- ============================================

-- Create ProductAddOn junction table
CREATE TABLE "ProductAddOn" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "mainProductId" TEXT NOT NULL,
  "addOnProductId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductAddOn_mainProductId_fkey" 
    FOREIGN KEY ("mainProductId") 
    REFERENCES "Product"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "ProductAddOn_addOnProductId_fkey" 
    FOREIGN KEY ("addOnProductId") 
    REFERENCES "Product"("id") 
    ON DELETE CASCADE,
  -- Prevent a product from being added as an add-on to itself
  CONSTRAINT "ProductAddOn_not_self" 
    CHECK ("mainProductId" != "addOnProductId")
);

-- Create unique constraint - prevent duplicate add-on relationships
CREATE UNIQUE INDEX "ProductAddOn_mainProductId_addOnProductId_key" 
  ON "ProductAddOn"("mainProductId", "addOnProductId");

-- Create indexes for better query performance
CREATE INDEX "ProductAddOn_mainProductId_idx" ON "ProductAddOn"("mainProductId");
CREATE INDEX "ProductAddOn_addOnProductId_idx" ON "ProductAddOn"("addOnProductId");


-- ============================================
-- UPDATE TRIGGERS for updatedAt
-- ============================================

-- Trigger for ProductVariant
CREATE OR REPLACE FUNCTION update_product_variant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variant_updated_at_trigger
BEFORE UPDATE ON "ProductVariant"
FOR EACH ROW
EXECUTE FUNCTION update_product_variant_updated_at();

-- Also update Product.updatedAt when variant changes
CREATE OR REPLACE FUNCTION update_product_on_variant_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Product" 
  SET "updatedAt" = CURRENT_TIMESTAMP 
  WHERE "id" = COALESCE(NEW."productId", OLD."productId");
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_on_variant_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON "ProductVariant"
FOR EACH ROW
EXECUTE FUNCTION update_product_on_variant_change();

-- Update Product.updatedAt when add-on relationship changes
CREATE OR REPLACE FUNCTION update_product_on_addon_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Product" 
  SET "updatedAt" = CURRENT_TIMESTAMP 
  WHERE "id" = COALESCE(NEW."mainProductId", OLD."mainProductId");
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_on_addon_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON "ProductAddOn"
FOR EACH ROW
EXECUTE FUNCTION update_product_on_addon_change();


-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON COLUMN "Product"."status" IS 'Product visibility status: active (visible on storefront) or hidden (admin only)';
COMMENT ON TABLE "ProductVariant" IS 'Stores variant options for products (e.g., sizes, colors)';
COMMENT ON COLUMN "ProductVariant"."options" IS 'JSON array of option objects with name and values';
COMMENT ON TABLE "ProductAddOn" IS 'Junction table linking main products to their add-on products';
