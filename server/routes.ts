import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { log } from "./index";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

let wsClients: Set<WebSocket> = new Set();

function broadcast(data: any) {
  const msg = JSON.stringify(data);
  wsClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  });

  app.use(sessionMiddleware);

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Not found");
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  // Product routes
  app.get("/api/products", requireAuth, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", requireAuth, upload.single("image"), async (req, res) => {
    const { name, pricePerKg } = req.body;
    if (!name || !pricePerKg) {
      return res.status(400).json({ message: "Name and price required" });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await storage.createProduct({
      name,
      pricePerKg: parseInt(pricePerKg, 10),
      imageUrl,
    });
    res.json(product);
  });

  app.patch("/api/products/:id", requireAuth, upload.single("image"), async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, pricePerKg, removeImage } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (pricePerKg) updateData.pricePerKg = parseInt(pricePerKg, 10);
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    if (removeImage === "true") updateData.imageUrl = null;

    const product = await storage.updateProduct(id, updateData);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await storage.deleteProduct(id);
    res.json({ ok: true });
  });

  // Order routes
  app.get("/api/orders", requireAuth, async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }
    const order = await storage.createOrder(items);
    broadcast({ type: "new_order", order });
    res.json(order);
  });

  app.patch("/api/orders/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }
    const order = await storage.updateOrderStatus(id, status);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    broadcast({ type: "order_updated", order });
    res.json(order);
  });

  // WebSocket
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    wsClients.add(ws);
    ws.on("close", () => wsClients.delete(ws));
  });

  return httpServer;
}
