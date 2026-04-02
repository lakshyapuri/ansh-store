/**
 * Ansh Provisional Store - Backend Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Data Setup ─────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

if (!fs.existsSync(DATA_FILE)) {
  const seedData = {
    products: [
      { id: '1', name: 'Basmati Rice (5kg)', category: 'Grains & Staples', price: 320, description: '', image: null, stock: 50, featured: true, createdAt: new Date().toISOString() }
    ],
    orders: [],
    adminCredentials: { username: 'admin', password: 'ansh123' }
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ─── PRODUCTS ─────────────────────────────────
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.products });
});

// ─── CREATE ORDER ─────────────────────────────────
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { customerName, address, phone, items, total } = req.body;

  if (!customerName || !address || !phone || !items || items.length === 0) {
    return res.status(400).json({ success: false });
  }

  const order = {
    id: 'ORD-' + Date.now(),
    customerName,
    address,
    phone,
    items,
    total,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDB(db);

  // 🔥 TELEGRAM ON ORDER
  const BOT_TOKEN = process.env.BOT_TOKEN; // 🔁 put your token here
  const CHAT_ID = '1411827354';

  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: `🛒 New Order!\nName: ${customerName}\nTotal: ₹${total}`
  });

  res.json({ success: true, data: order });
});

// ─── GET ORDERS ─────────────────────────────────
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.orders });
});

// ─── UPDATE ORDER STATUS ─────────────────────────────────
app.put('/api/orders/:id', async (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex(o => o.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false });
  }

  const newStatus = req.body.status;
  db.orders[index].status = newStatus;
  writeDB(db);

  // 🔥 TELEGRAM ON DELIVERY
  if (newStatus === 'Delivered') {
    const BOT_TOKEN = process.env.BOT_TOKEN; // 🔁 same token here
    const CHAT_ID = '1411827354';

    const order = db.orders[index];

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🚚 Delivered!\nName: ${order.customerName}\nTotal: ₹${order.total}`
    });
  }

  res.json({ success: true, data: db.orders[index] });
});

// ─── ADMIN LOGIN ─────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const db = readDB();
  const { username, password } = req.body;

  if (username === db.adminCredentials.username && password === db.adminCredentials.password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// ─── FRONTEND ─────────────────────────────────
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── START SERVER ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});