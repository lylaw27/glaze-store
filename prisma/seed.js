const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper function to generate a URL-friendly handle from name
function generateHandle(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    handle: "wireless-bluetooth-headphones",
    description: "Premium noise-cancelling headphones with 30-hour battery life",
    price: 149.99,
    stock: 25,
    categories: JSON.stringify(["Electronics", "Audio"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"]),
  },
  {
    name: "Organic Green Tea Set",
    handle: "organic-green-tea-set",
    description: "Collection of 5 premium organic green teas from Japan",
    price: 34.99,
    stock: 50,
    categories: JSON.stringify(["Food & Beverages", "Tea"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"]),
  },
  {
    name: "Minimalist Leather Wallet",
    handle: "minimalist-leather-wallet",
    description: "Genuine leather slim wallet with RFID blocking",
    price: 45.0,
    stock: 40,
    categories: JSON.stringify(["Accessories", "Fashion"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"]),
  },
  {
    name: "Smart Fitness Watch",
    handle: "smart-fitness-watch",
    description: "Track your health with heart rate monitor and GPS",
    price: 199.99,
    stock: 30,
    categories: JSON.stringify(["Electronics", "Fitness"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"]),
  },
  {
    name: "Ceramic Plant Pot Set",
    handle: "ceramic-plant-pot-set",
    description: "Set of 3 modern ceramic pots for indoor plants",
    price: 28.5,
    stock: 60,
    categories: JSON.stringify(["Home & Garden", "Decor"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400"]),
  },
  {
    name: "Bamboo Cutting Board",
    handle: "bamboo-cutting-board",
    description: "Eco-friendly large bamboo cutting board with juice groove",
    price: 32.0,
    stock: 45,
    categories: JSON.stringify(["Kitchen", "Home"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400"]),
  },
  {
    name: "Scented Candle Collection",
    handle: "scented-candle-collection",
    description: "Set of 4 hand-poured soy candles with natural fragrances",
    price: 42.0,
    stock: 35,
    categories: JSON.stringify(["Home & Garden", "Decor"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1602607753990-986e0568d3bb?w=400"]),
  },
  {
    name: "Portable Bluetooth Speaker",
    handle: "portable-bluetooth-speaker",
    description: "Waterproof speaker with 360° sound and 12-hour playtime",
    price: 79.99,
    stock: 20,
    categories: JSON.stringify(["Electronics", "Audio"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"]),
  },
  {
    name: "Yoga Mat Premium",
    handle: "yoga-mat-premium",
    description: "Extra thick eco-friendly yoga mat with carrying strap",
    price: 55.0,
    stock: 40,
    categories: JSON.stringify(["Fitness", "Sports"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400"]),
  },
  {
    name: "Stainless Steel Water Bottle",
    handle: "stainless-steel-water-bottle",
    description: "Double-walled insulated bottle keeps drinks cold 24hrs",
    price: 29.99,
    stock: 80,
    categories: JSON.stringify(["Kitchen", "Fitness"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"]),
  },
  {
    name: "Artisan Coffee Beans",
    handle: "artisan-coffee-beans",
    description: "1kg bag of single-origin Ethiopian coffee beans",
    price: 24.99,
    stock: 55,
    categories: JSON.stringify(["Food & Beverages", "Coffee"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"]),
  },
  {
    name: "Wireless Charging Pad",
    handle: "wireless-charging-pad",
    description: "Fast 15W wireless charger compatible with all Qi devices",
    price: 35.0,
    stock: 65,
    categories: JSON.stringify(["Electronics", "Accessories"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=400"]),
  },
  {
    name: "Cotton Throw Blanket",
    handle: "cotton-throw-blanket",
    description: "Soft woven cotton blanket perfect for cozy evenings",
    price: 48.0,
    stock: 30,
    categories: JSON.stringify(["Home & Garden", "Bedding"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"]),
  },
  {
    name: "LED Desk Lamp",
    handle: "led-desk-lamp",
    description: "Adjustable desk lamp with 5 brightness levels and USB port",
    price: 42.99,
    stock: 25,
    categories: JSON.stringify(["Electronics", "Home"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"]),
  },
  {
    name: "Leather Journal Notebook",
    handle: "leather-journal-notebook",
    description: "Handcrafted leather journal with 200 lined pages",
    price: 28.0,
    stock: 50,
    categories: JSON.stringify(["Stationery", "Accessories"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"]),
  },
  {
    name: "Essential Oil Diffuser",
    handle: "essential-oil-diffuser",
    description: "Ultrasonic aromatherapy diffuser with LED lights",
    price: 38.99,
    stock: 35,
    categories: JSON.stringify(["Home & Garden", "Wellness"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"]),
  },
  {
    name: "Resistance Bands Set",
    handle: "resistance-bands-set",
    description: "Set of 5 exercise bands with different resistance levels",
    price: 22.99,
    stock: 70,
    categories: JSON.stringify(["Fitness", "Sports"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400"]),
  },
  {
    name: "Mechanical Keyboard",
    handle: "mechanical-keyboard",
    description: "RGB backlit mechanical keyboard with blue switches",
    price: 89.99,
    stock: 15,
    categories: JSON.stringify(["Electronics", "Gaming"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1595225476474-87563907a212?w=400"]),
  },
  {
    name: "Succulent Plant Kit",
    handle: "succulent-plant-kit",
    description: "DIY succulent terrarium kit with 5 plants and supplies",
    price: 36.0,
    stock: 40,
    categories: JSON.stringify(["Home & Garden", "Plants"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400"]),
  },
  {
    name: "Polarized Sunglasses",
    handle: "polarized-sunglasses",
    description: "Classic aviator style with UV400 protection",
    price: 65.0,
    stock: 45,
    categories: JSON.stringify(["Fashion", "Accessories"]),
    images: JSON.stringify(["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"]),
  },
];

async function main() {
  console.log("Creating 20 dummy products...");
  
  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  
  console.log("✅ Created 20 dummy products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
