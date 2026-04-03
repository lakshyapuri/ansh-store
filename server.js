/**
 * Ansh Provisional Store - Backend Server (FINAL FIXED)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Database ─────────────────
const DATA_FILE = path.join(__dirname, 'db.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    products: [{ id: '1', name: 'Rice', price: 100 }],
    orders: [],
    adminCredentials: { username: 'admin', password: 'ansh123' }
  }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeDB = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ─── PRODUCTS ─────────────────

// Get products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.products });
});

// ✅ ADD PRODUCT (FIXED)
app.post('/api/products', (req, res) => {
  const db = readDB();
  const { name, price } = req.body;

  if (!name || !price) {
    return res.json({ success: false });
  }

  const product = {
    id: Date.now().toString(),
    name,
    price: Number(price)
  };

  db.products.push(product);
  writeDB(db);

  res.json({ success: true, data: product });
});

// ─── ORDERS ─────────────────

// Create order
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { customerName, phone, address, items, total } = req.body;

  if (!customerName || !phone || !address || !items) {
    return res.json({ success: false });
  }

  const order = {
    id: 'ORD-' + Date.now(),
    customerName,
    phone,
    address,
    items,
    total,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDB(db);

  // 📲 TELEGRAM MESSAGE (FIXED FORMAT)
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '1411827354';

  if (BOT_TOKEN) {
    const itemsText = items.map(i => `- ${i.name} x${i.qty}`).join('\n');

    const message = `
📦 Order ID: ${order.id}
👤 Name: ${customerName}
📞 Phone: ${phone}
📍 Address: ${address}
💰 Total: ₹${total}

🧾 Items:
${itemsText}
`;

    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    }).catch(() => {});
  }

  res.json({ success: true, data: order });
});

// Get orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.orders });
});

// Update status
app.put('/api/orders/:id', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.json({ success: false });
  }

  order.status = req.body.status;
  writeDB(db);

  // 📲 DELIVERY MESSAGE
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '1411827354';

  if (order.status === 'Delivered' && BOT_TOKEN) {
    const message = `
🚚 Order Delivered!

📦 Order ID: ${order.id}
👤 Name: ${order.customerName}
💰 Total: ₹${order.total}
`;

    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    }).catch(() => {});
  }

  res.json({ success: true });
});

// ─── ADMIN LOGIN ─────────────────
app.post('/api/admin/login', (req, res) => {
  const db = readDB();
  const { username, password } = req.body;

  if (username === db.adminCredentials.username && password === db.adminCredentials.password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ─── START SERVER ─────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});