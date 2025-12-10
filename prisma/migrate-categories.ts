import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../lib/prisma";

/**
 * Migration script to convert existing product categories from JSON array to relational structure
 * 
 * ⚠️ NOTE: This script is only needed if you had products with the OLD category format (JSON string array).
 * If your database already has the Category and ProductCategory tables and all products are using
 * the new relational format, you DO NOT need to run this script.
 * 
 * This script:
 * 1. Finds all products with categories in the old JSON format
 * 2. Creates Category records for each unique category name
 * 3. Creates ProductCategory relationships
 * 4. Preserves category type as "Uncategorized" for migrated data (can be updated later)
 */

async function migrateCategories() {
  console.log("Starting category migration...");

  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        categories: true,
      },
    });

    console.log(`Found ${products.length} products to check`);

    // Collect all unique category names from products
    const categoryNames = new Set<string>();
    const productCategoryMap = new Map<string, string[]>(); // productId -> category names

    for (const product of products) {
      try {
        // Check if categories field exists and is a valid JSON array
        if (product.categories) {
          const cats = JSON.parse(product.categories);
          if (Array.isArray(cats) && cats.length > 0) {
            productCategoryMap.set(product.id, cats);
            cats.forEach((cat: string) => categoryNames.add(cat));
          }
        }
      } catch (error) {
        console.log(`Skipping product ${product.name} - already using new format`);
      }
    }

    console.log(`Found ${categoryNames.size} unique categories to migrate`);

    if (categoryNames.size === 0) {
      console.log("No categories to migrate. All products are already using the new format.");
      return;
    }

    // Create Category records for each unique category
    const categoryMap = new Map<string, string>(); // category name -> category id

    for (const categoryName of categoryNames) {
      try {
        // Try to find existing category first
        let category = await prisma.category.findUnique({
          where: { name: categoryName },
        });

        // If not found, create it
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              type: "Uncategorized", // Default type - can be updated later via admin UI
            },
          });
          console.log(`Created category: ${categoryName}`);
        }

        categoryMap.set(categoryName, category.id);
      } catch (error) {
        console.error(`Error creating category ${categoryName}:`, error);
      }
    }

    // Create ProductCategory relationships
    let relationshipsCreated = 0;
    for (const [productId, categoryNames] of productCategoryMap.entries()) {
      for (const categoryName of categoryNames) {
        const categoryId = categoryMap.get(categoryName);
        if (categoryId) {
          try {
            // Check if relationship already exists
            const existing = await prisma.productCategory.findFirst({
              where: {
                productId,
                categoryId,
              },
            });

            if (!existing) {
              await prisma.productCategory.create({
                data: {
                  productId,
                  categoryId,
                },
              });
              relationshipsCreated++;
            }
          } catch (error) {
            console.error(`Error creating relationship for product ${productId} and category ${categoryName}:`, error);
          }
        }
      }
    }

    console.log(`Migration complete! Created ${relationshipsCreated} product-category relationships.`);
    console.log("\nNote: Migrated categories have type 'Uncategorized'. You can update them via the admin panel.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCategories()
  .then(() => {
    console.log("Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
