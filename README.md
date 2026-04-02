# 🛒 Ansh Provisional Store — Complete E-Commerce Website

A full-stack, modern e-commerce website for a local provisional/grocery store.

---

## 📁 Project Structure

```
ansh-store/
├── frontend/
│   └── index.html          # Complete frontend (HTML + CSS + JS)
│
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json
│   └── data/
│       └── db.json         # Auto-generated JSON database (seed data included)
│
└── README.md
```

---

## 🚀 Quick Start

### Option A: Frontend Only (No backend needed)
Just open `frontend/index.html` in your browser. It works with offline fallback data!

### Option B: Full Stack (Frontend + Backend)

#### Step 1 — Start the Backend
```bash
cd backend
npm install
npm start
```
Backend will run at: `http://localhost:5000`

#### Step 2 — Open the Frontend
Open `frontend/index.html` in your browser.
(Or serve with VS Code Live Server)

---

## 🔑 Admin Panel Access

URL: Click "Admin" button in the navbar

**Default credentials:**
- Username: `admin`
- Password: `ansh123`

---

## ✨ Features

### Customer Side
- 🏠 **Homepage** with hero banner, featured products, and stats
- 🛍️ **Shop Page** with all products, category filters, and search
- 📄 **Product Detail** page with quantity selector
- 🛒 **Cart** (slide-out drawer) with add/remove/update quantity
- ✅ **Checkout** with form validation
- 🎉 **Order Confirmation** screen

### Admin Panel
- 📊 **Dashboard Overview** with stats (products, orders, revenue)
- ➕ **Add Products** with image upload
- ✏️ **Edit Products** inline
- 🗑️ **Delete Products**
- 📋 **View & Manage Orders** with status updates (Pending → Confirmed → Delivered)

---

## 🔌 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products?category=Snacks` | Filter by category |
| GET | `/api/products?search=rice` | Search products |
| GET | `/api/products?featured=true` | Featured products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Add product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |
| GET | `/api/categories` | All categories |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | All orders (Admin) |
| PUT | `/api/orders/:id` | Update order status |
| POST | `/api/admin/login` | Admin authentication |

---

## 🔄 Switching to MongoDB

Replace the `readDB()` and `writeDB()` helpers in `server.js` with MongoDB operations using **Mongoose**:

```bash
npm install mongoose
```

```js
// In server.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ansh-store');
```

---

## 🎨 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no framework needed)
- **Backend**: Node.js + Express
- **Database**: JSON file (swap to MongoDB easily)
- **Icons**: Lucide Icons (CDN)
- **Fonts**: Google Fonts (Playfair Display + Nunito)
- **Storage**: localStorage for cart persistence

---

## 📱 Mobile Responsive
Fully responsive — works on phones, tablets, and desktops.

---

## 🛡️ Security Note (Production)
Before going live, add:
- JWT authentication for admin (replace simple token)
- Rate limiting (`express-rate-limit`)
- Input sanitization (`express-validator`)
- HTTPS
- Environment variables for credentials

---

Made with ❤️ for Ansh Provisional Store
