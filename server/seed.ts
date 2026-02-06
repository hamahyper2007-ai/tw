import { storage } from "./storage";
import { log } from "./index";

const defaultProducts = [
  { name: "Fstq akbary", pricePerKg: 18500 },
  { name: "Noky irany brzhaw", pricePerKg: 4000 },
  { name: "Mewzh ozbaki", pricePerKg: 8000 },
  { name: "Tekalay charas", pricePerKg: 14000 },
  { name: "Gulla barozha", pricePerKg: 4500 },
  { name: "Tekala taybat", pricePerKg: 18000 },
  { name: "Ganma shami", pricePerKg: 4500 },
  { name: "Muqarmsh", pricePerKg: 4250 },
  { name: "Kolaka kam xwe", pricePerKg: 7000 },
  { name: "Gwez sax", pricePerKg: 6000 },
  { name: "Alibaba sada", pricePerKg: 4500 },
  { name: "Badam swer", pricePerKg: 14000 },
  { name: "Fstq ahmady", pricePerKg: 16500 },
  { name: "Kolakay spi", pricePerKg: 7500 },
  { name: "Gazo sada", pricePerKg: 15500 },
];

const defaultUsers = [
  { username: "sender", password: "sender123", role: "sender" },
  { username: "receiver", password: "receiver123", role: "receiver" },
  { username: "admin", password: "admin123", role: "admin" },
];

export async function seedDatabase() {
  try {
    for (const userData of defaultUsers) {
      const existing = await storage.getUserByUsername(userData.username);
      if (!existing) {
        await storage.createUser(userData);
        log(`Created user: ${userData.username}`);
      }
    }

    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      for (const product of defaultProducts) {
        await storage.createProduct({ ...product, imageUrl: null });
        log(`Created product: ${product.name}`);
      }
    }

    log("Database seeded successfully");
  } catch (error) {
    log(`Seed error: ${error}`);
  }
}
