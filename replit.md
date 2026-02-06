# Wholesale Manager

## Overview
Admin-only wholesale management web application for selling items by kilogram (KG) with Iraqi Dinar (IQD) pricing. Features role-based access with 3 demo accounts (Sender, Receiver, Admin), real-time order sync via WebSocket, and persistent PostgreSQL database.

## Architecture
- **Frontend**: React + Vite + TypeScript with Tailwind CSS and shadcn/ui components
- **Backend**: Express.js with session-based auth, multer for image uploads
- **Database**: PostgreSQL via Drizzle ORM
- **Real-time**: WebSocket for instant order notifications

## Key Features
- **Sender**: Product CRUD, dual IQD/KG calculator with smart rounding (250 IQD steps), basket & order system
- **Receiver**: Real-time incoming orders, mark as completed
- **Admin**: Dashboard with revenue, orders, KG sold stats, order history, product sales breakdown

## Project Structure
```
client/src/
  App.tsx           - Main app with auth routing
  lib/auth.tsx      - Auth context & hooks
  lib/websocket.ts  - WebSocket client
  pages/login.tsx   - Login with 3 demo accounts
  pages/sender.tsx  - Sender dashboard
  pages/receiver.tsx - Receiver dashboard
  pages/admin.tsx   - Admin dashboard
  components/
    product-card.tsx    - Product display card
    product-dialog.tsx  - Add/edit product dialog
    kg-calculator.tsx   - Dual IQD/KG calculator

server/
  index.ts    - Express server entry
  routes.ts   - API routes + WebSocket + session auth
  storage.ts  - Database storage layer
  db.ts       - Drizzle/PostgreSQL connection
  seed.ts     - Seed demo users & products

shared/
  schema.ts   - Drizzle schema + TypeScript types
```

## Demo Accounts
- sender / sender123 (role: sender)
- receiver / receiver123 (role: receiver)
- admin / admin123 (role: admin)

## Database Tables
- users (id, username, password, role)
- products (id, name, price_per_kg, image_url)
- orders (id, status, created_at, completed_at)
- order_items (id, order_id, product_id, product_name, price_per_kg, paid_amount, weight_kg)
