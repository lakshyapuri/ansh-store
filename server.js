const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── DATA ─────────────────
const DATA_FILE = path.join(__dirname, 'db.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    products: [
      { id: '1', name: 'Rice', price: 100 }
    ],
    orders: [],
    adminCredentials: { username: 'admin', password: 'ansh123' }
  }));
}

const readDB = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeDB = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ─── PRODUCTS ─────────────────
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.products });
});

// ─── CREATE ORDER ─────────────────
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { customerName, phone, address, items, total } = req.body;

  const order = {
    id: 'ORD-' + Date.now(),
    customerName,
    phone,
    address,
    items,
    total,
    status: 'Pending'
  };

  db.orders.push(order);
  writeDB(db);

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '1411827354';

  if (BOT_TOKEN) {
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🛒 New Order!\n${customerName} - ₹${total}`
    }).catch(() => {});
  }

  res.json({ success: true });
});

// ─── GET ORDERS ─────────────────
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.orders });
});

// ─── UPDATE STATUS ─────────────────
app.put('/api/orders/:id', (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);

  if (!order) return res.json({ success: false });

  order.status = req.body.status;
  writeDB(db);

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '1411827354';

  if (order.status === 'Delivered' && BOT_TOKEN) {
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🚚 Delivered: ${order.customerName}`
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

// ─── START ─────────────────
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});