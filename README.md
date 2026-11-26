# Vika-Vastra

> **A Heritage in Every Drape** — Authentic Luxury Indian Handloom & Bridal Saree E-Commerce Platform.

---

## 🏛️ Project Overview

**Vika Vastra** is a full-stack, enterprise-grade e-commerce web application specializing in authentic luxury Indian handloom sarees, including Soft Silk, Kanchipuram Pure Silk, Banarasi, Cotton, Organza, and Bridal Best collections.

The project is structured as a modular mono-repo with three dedicated applications:

1. **`Client/`** — High-end customer-facing storefront built with React.js, featuring royal heritage aesthetics (Royal Maroon `#720E1E`, Royal Gold `#DFB143`, and Warm Silk Cream `#FBECD7`), dynamic categories, multi-filter catalog, wishlist, responsive shopping cart, and smooth animations.
2. **`Admin/`** — Comprehensive merchant administration dashboard for product catalog management, category & subcategory management, inventory tracking, banner slideshow controls, order processing, and analytics.
3. **`Server/`** — Robust RESTful API backend built with Node.js, Express, Sequelize/MySQL2, JWT authentication, Multer file storage, and Razorpay payment integration.

---

## 📁 Repository Structure

```
Vika-Vastra/
├── Client/                 # React.js Customer Storefront
│   ├── public/             # Static assets, favicon, logo icons
│   ├── src/                # Components, wrappers, redux, pages, styles
│   └── package.json
│
├── Admin/                  # React.js Merchant Admin Dashboard
│   ├── public/             # Admin static assets
│   ├── src/                # Admin views, product/category tables, order management
│   └── package.json
│
├── Server/                 # Node.js Express REST API & Database
│   ├── config/             # Database connection & Sequelize config
│   ├── controllers/        # Business logic & request handlers
│   ├── models/             # MySQL Sequelize ORM models
│   ├── routes/             # API route definitions
│   ├── uploads/            # Product photos, banners, media assets
│   ├── server.js           # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── .gitignore              # Repository ignore rules
└── README.md               # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **MySQL** (v8.0 or MariaDB, running via XAMPP/WAMP or native MySQL service)
- **Git**

---

### 1. Database Setup
1. Start your local MySQL service (e.g. XAMPP).
2. Create the MySQL database:
   ```sql
   CREATE DATABASE kalpana_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

### 2. Backend Server Setup
```bash
cd Server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm start
```
*Backend runs on:* `http://localhost:5000`

---

### 3. Client Storefront Setup
```bash
cd ../Client
npm install
npm start
```
*Client runs on:* `http://localhost:3000` (or `3001`)

---

### 4. Admin Dashboard Setup
```bash
cd ../Admin
npm install
npm start
```
*Admin runs on:* `http://localhost:3002`

---

## 🎨 Design System & Color Palette

- **Royal Maroon**: `#720E1E` (Primary heritage accent, header background)
- **Royal Gold**: `#C59B27` / `#DFB143` (Luxury button gradient, highlights)
- **Warm Silk Cream**: `#FBECD7` (Text contrast, badge cards, silk paper undertones)
- **Typography**: `Cinzel Decorative` (Brand title), `Cormorant Garamond` (Nav & headings), `DM Sans` (Body & UI controls)

---

## 📄 License
This project is proprietary and confidential. All rights reserved © 2026 Vika Vastra.

