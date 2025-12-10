// Migration script to seed data from SQLite to Supabase PostgreSQL
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/migrate-to-supabase.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data exported from SQLite
const products = [
  {
    id: "ab97bd1b-780d-420f-ae0b-51f7d5f110f1",
    name: "Wireless Bluetooth Headphones",
    handle: "wireless-bluetooth-headphones-ab97bd1b",
    description: "Premium noise-cancelling headphones with 30-hour battery life",
    price: 149.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]),
    categories: JSON.stringify(["Electronics", "Audio"]),
    stock: 25,
  },
  {
    id: "ecdbdc57-1e55-4258-b424-98b1e9b44f4e",
    name: "Organic Green Tea Set",
    handle: "organic-green-tea-set-ecdbdc57",
    description: "Collection of 5 premium organic green teas from Japan",
    price: 34.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"]),
    categories: JSON.stringify(["Food & Beverages", "Tea"]),
    stock: 50,
  },
  {
    id: "76001179-a37b-49eb-854f-52abea3f6a95",
    name: "Minimalist Leather Wallet",
    handle: "minimalist-leather-wallet-76001179",
    description: "Genuine leather slim wallet with RFID blocking",
    price: 45.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"]),
    categories: JSON.stringify(["Accessories", "Fashion"]),
    stock: 40,
  },
  {
    id: "c79f17be-4f0a-4847-af7a-24c317300d0f",
    name: "Smart Fitness Watch",
    handle: "smart-fitness-watch-c79f17be",
    description: "Track your health with heart rate monitor and GPS",
    price: 199.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"]),
    categories: JSON.stringify(["Electronics", "Fitness"]),
    stock: 30,
  },
  {
    id: "634442db-8285-4cd0-b6e1-ad146735896b",
    name: "Ceramic Plant Pot Set",
    handle: "ceramic-plant-pot-set-634442db",
    description: "Set of 3 modern ceramic pots for indoor plants",
    price: 28.5,
    images: JSON.stringify(["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400"]),
    categories: JSON.stringify(["Home & Garden", "Decor"]),
    stock: 60,
  },
  {
    id: "3e4bb8fe-0180-4d68-998a-8e1f44eae8e3",
    name: "Bamboo Cutting Board",
    handle: "bamboo-cutting-board-3e4bb8fe",
    description: "Eco-friendly large bamboo cutting board with juice groove",
    price: 32.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400"]),
    categories: JSON.stringify(["Kitchen", "Home"]),
    stock: 45,
  },
  {
    id: "8057966d-ee24-4c21-91d8-a2dc49a063ac",
    name: "Scented Candle Collection",
    handle: "scented-candle-collection-8057966d",
    description: "Set of 4 hand-poured soy candles with natural fragrances",
    price: 42.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1602607753990-986e0568d3bb?w=400"]),
    categories: JSON.stringify(["Home & Garden", "Decor"]),
    stock: 35,
  },
  {
    id: "6209356e-7107-42e6-9276-780f8331dfa1",
    name: "Portable Bluetooth Speaker",
    handle: "portable-bluetooth-speaker-6209356e",
    description: "Waterproof speaker with 360° sound and 12-hour playtime",
    price: 79.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"]),
    categories: JSON.stringify(["Electronics", "Audio"]),
    stock: 20,
  },
  {
    id: "828c27e4-782a-4d59-8996-a8c45bd68fb2",
    name: "Yoga Mat Premium",
    handle: "yoga-mat-premium-828c27e4",
    description: "Extra thick eco-friendly yoga mat with carrying strap",
    price: 55.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400"]),
    categories: JSON.stringify(["Fitness", "Sports"]),
    stock: 40,
  },
  {
    id: "65de6aa0-80ef-487c-8d29-8d6680ecb487",
    name: "Stainless Steel Water Bottle",
    handle: "stainless-steel-water-bottle-65de6aa0",
    description: "Double-walled insulated bottle keeps drinks cold 24hrs",
    price: 29.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"]),
    categories: JSON.stringify(["Kitchen", "Fitness"]),
    stock: 80,
  },
  {
    id: "0d542346-116f-4153-84d7-b6f19d5c7a37",
    name: "Artisan Coffee Beans",
    handle: "artisan-coffee-beans-0d542346",
    description: "1kg bag of single-origin Ethiopian coffee beans",
    price: 24.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"]),
    categories: JSON.stringify(["Food & Beverages", "Coffee"]),
    stock: 55,
  },
  {
    id: "9e12a195-94c8-4f7a-ac03-886c724cccf4",
    name: "Wireless Charging Pad",
    handle: "wireless-charging-pad-9e12a195",
    description: "Fast 15W wireless charger compatible with all Qi devices",
    price: 35.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=400"]),
    categories: JSON.stringify(["Electronics", "Accessories"]),
    stock: 65,
  },
  {
    id: "77c8cf08-f4bc-412e-a7e1-3da713f5bd7d",
    name: "Cotton Throw Blanket",
    handle: "cotton-throw-blanket-77c8cf08",
    description: "Soft woven cotton blanket perfect for cozy evenings",
    price: 48.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"]),
    categories: JSON.stringify(["Home & Garden", "Bedding"]),
    stock: 30,
  },
  {
    id: "484782a1-7e39-4593-b9ee-6a8a4561d005",
    name: "LED Desk Lamp",
    handle: "led-desk-lamp-484782a1",
    description: "Adjustable desk lamp with 5 brightness levels and USB port",
    price: 42.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"]),
    categories: JSON.stringify(["Electronics", "Home"]),
    stock: 25,
  },
  {
    id: "8a9d61c2-4edd-4bd3-85ea-d7907c3d4ae1",
    name: "Leather Journal Notebook",
    handle: "leather-journal-notebook-8a9d61c2",
    description: "Handcrafted leather journal with 200 lined pages",
    price: 28.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"]),
    categories: JSON.stringify(["Stationery", "Accessories"]),
    stock: 50,
  },
  {
    id: "00be3a07-81ae-4dbb-89c2-a0c4f2480110",
    name: "Essential Oil Diffuser",
    handle: "essential-oil-diffuser-00be3a07",
    description: "Ultrasonic aromatherapy diffuser with LED lights",
    price: 38.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"]),
    categories: JSON.stringify(["Home & Garden", "Wellness"]),
    stock: 35,
  },
  {
    id: "46c8a1eb-046a-46eb-8f0b-8373fa7f2607",
    name: "Resistance Bands Set",
    handle: "resistance-bands-set-46c8a1eb",
    description: "Set of 5 exercise bands with different resistance levels",
    price: 22.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400"]),
    categories: JSON.stringify(["Fitness", "Sports"]),
    stock: 70,
  },
  {
    id: "4ecfe45a-c8d5-4b4d-98a0-c945d18d361d",
    name: "Mechanical Keyboard",
    handle: "mechanical-keyboard-4ecfe45a",
    description: "RGB backlit mechanical keyboard with blue switches",
    price: 89.99,
    images: JSON.stringify(["https://images.unsplash.com/photo-1595225476474-87563907a212?w=400"]),
    categories: JSON.stringify(["Electronics", "Gaming"]),
    stock: 15,
  },
  {
    id: "85e4c437-3d06-48d7-b3cb-dad4c87708db",
    name: "Succulent Plant Kit",
    handle: "succulent-plant-kit-85e4c437",
    description: "DIY succulent terrarium kit with 5 plants and supplies",
    price: 36.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400"]),
    categories: JSON.stringify(["Home & Garden", "Plants"]),
    stock: 40,
  },
  {
    id: "5a3bbef1-14cf-45e7-bafa-ffb104b11719",
    name: "Polarized Sunglasses",
    handle: "polarized-sunglasses-5a3bbef1",
    description: "Classic aviator style with UV400 protection",
    price: 65.0,
    images: JSON.stringify(["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"]),
    categories: JSON.stringify(["Fashion", "Accessories"]),
    stock: 45,
  },
];

async function main() {
  console.log("Starting migration to Supabase...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Insert products
  console.log("Inserting products...");
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`  Created: ${product.name}`);
  }

  console.log(`\nMigration complete! Inserted ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
