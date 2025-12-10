import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../lib/prisma";

/**
 * Seed script to populate the database with initial categories
 */

const defaultCategories = [
  // Department categories
  { name: "Arts", type: "Department" },
  { name: "Electronics", type: "Department" },
  { name: "Furniture", type: "Department" },
  { name: "Home & Garden", type: "Department" },
  { name: "Pottery", type: "Department" },
  { name: "Ceramics", type: "Department" },
  { name: "Glassware", type: "Department" },
  
  // Festival/Seasonal categories
  { name: "Christmas", type: "Festival" },
  { name: "Easter", type: "Festival" },
  { name: "Halloween", type: "Festival" },
  { name: "Valentine's Day", type: "Festival" },
  
  // Style categories
  { name: "Modern", type: "Style" },
  { name: "Vintage", type: "Style" },
  { name: "Rustic", type: "Style" },
  { name: "Contemporary", type: "Style" },
];

async function seedCategories() {
  console.log("Starting category seed...");

  try {
    let created = 0;
    let skipped = 0;

    for (const category of defaultCategories) {
      const existing = await prisma.category.findUnique({
        where: { name: category.name },
      });

      if (existing) {
        console.log(`Category "${category.name}" already exists, skipping...`);
        skipped++;
      } else {
        await prisma.category.create({
          data: category,
        });
        console.log(`Created category: ${category.name} (${category.type})`);
        created++;
      }
    }

    console.log(`\nSeed complete! Created ${created} categories, skipped ${skipped} existing categories.`);
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedCategories()
  .then(() => {
    console.log("Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script failed:", error);
    process.exit(1);
  });
