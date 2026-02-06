import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, products, orders, orderItems,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type OrderWithItems,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allItems = await db.select().from(orderItems);

    return allOrders.map((order) => ({
      ...order,
      items: allItems.filter((item) => item.orderId === order.id),
    }));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async createOrder(items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [order] = await db.insert(orders).values({ status: "pending" }).returning();
    const createdItems: OrderItem[] = [];
    for (const item of items) {
      const [created] = await db.insert(orderItems).values({ ...item, orderId: order.id }).returning();
      createdItems.push(created);
    }
    return { ...order, items: createdItems };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
