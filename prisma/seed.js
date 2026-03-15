const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
  {
    name: "Midnight Eclipse Hoodie",
    description: "Premium heavyweight cotton hoodie with a sleek matte-black finish. Features an oversized silhouette, kangaroo pocket, and embroidered DropCart logo on the chest. Perfect for late-night drops and everyday style.",
    price: 3499,
    originalPrice: 4999,
    category: "Apparel",
    brand: "DropCart Originals",
    images: JSON.stringify(["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop"]),
    stock: 45,
    rating: 4.8,
    reviewsCount: 124,
    featured: true,
    tags: JSON.stringify(["hoodie", "streetwear", "bestseller"]),
  },
  {
    name: "Neon Runner Sneakers",
    description: "Lightweight performance sneakers with reactive foam cushioning and breathable mesh upper. Glow-in-the-dark accents on the sole for that after-dark aesthetic.",
    price: 5999,
    originalPrice: 7499,
    category: "Footwear",
    brand: "DropCart Sport",
    images: JSON.stringify(["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]),
    stock: 28,
    rating: 4.6,
    reviewsCount: 87,
    featured: true,
    tags: JSON.stringify(["sneakers", "running", "neon"]),
  },
  {
    name: "Carbon Fiber Watch",
    description: "Ultra-thin smartwatch with carbon fiber casing, AMOLED display, and 7-day battery life. Water resistant to 50m. Tracks heart rate, sleep, and workouts.",
    price: 12999,
    originalPrice: 16999,
    flashSalePrice: 9999,
    category: "Accessories",
    brand: "DropCart Tech",
    images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"]),
    stock: 15,
    rating: 4.9,
    reviewsCount: 203,
    featured: true,
    tags: JSON.stringify(["watch", "smartwatch", "flash-sale"]),
  },
  {
    name: "Shadow Denim Jacket",
    description: "Washed black denim jacket with a distressed finish and brushed nickel hardware. Relaxed fit with interior fleece lining for warmth without bulk.",
    price: 4299,
    originalPrice: 5499,
    category: "Apparel",
    brand: "DropCart Originals",
    images: JSON.stringify(["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop"]),
    stock: 32,
    rating: 4.5,
    reviewsCount: 56,
    featured: false,
    tags: JSON.stringify(["denim", "jacket", "streetwear"]),
  },
  {
    name: "Titanium Wireless Earbuds",
    description: "Active noise cancelling earbuds with 36-hour total battery life and IPX5 sweat resistance. Crystal-clear audio with deep bass for immersive listening.",
    price: 7999,
    originalPrice: 9999,
    category: "Electronics",
    brand: "DropCart Audio",
    images: JSON.stringify(["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop"]),
    stock: 60,
    rating: 4.7,
    reviewsCount: 312,
    featured: true,
    tags: JSON.stringify(["earbuds", "wireless", "audio"]),
  },
  {
    name: "Obsidian Backpack",
    description: "30L urban backpack made from recycled ripstop nylon. Features padded laptop compartment (fits 16\"), hidden anti-theft pocket, and USB charging port.",
    price: 2799,
    originalPrice: 3499,
    category: "Accessories",
    brand: "DropCart Originals",
    images: JSON.stringify(["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"]),
    stock: 40,
    rating: 4.4,
    reviewsCount: 78,
    featured: false,
    tags: JSON.stringify(["backpack", "travel", "everyday"]),
  },
  {
    name: "Stealth Joggers",
    description: "Tech-fleece joggers with tapered fit and zip pockets. Moisture-wicking fabric keeps you dry during workouts or casual outings. Available in Charcoal.",
    price: 2499,
    originalPrice: 3299,
    category: "Apparel",
    brand: "DropCart Sport",
    images: JSON.stringify(["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop"]),
    stock: 55,
    rating: 4.3,
    reviewsCount: 91,
    featured: false,
    tags: JSON.stringify(["joggers", "athleisure", "comfort"]),
  },
  {
    name: "Prism Sunglasses",
    description: "Polarized sunglasses with titanium frame and gradient lenses. UV400 protection with anti-scratch coating. Comes with a premium hardshell case.",
    price: 1999,
    originalPrice: 2999,
    category: "Accessories",
    brand: "DropCart Style",
    images: JSON.stringify(["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop"]),
    stock: 70,
    rating: 4.6,
    reviewsCount: 145,
    featured: true,
    tags: JSON.stringify(["sunglasses", "fashion", "summer"]),
  },

  {
  name: "Flash Sale Sneakers",
  description: "Limited drop sneakers",
  price: 5999,
  flashSalePrice: 3999,
  saleStartTime: new Date(),
  saleEndTime: new Date(Date.now() + 3600000),
  images: JSON.stringify([
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
  ]),
  stock: 20,
},
];

async function main() {
  console.log("🌱 Seeding DropCart database...");
  
  // Clear existing products
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Seeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
