const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ─── Database setup ───────────────────────────────────────────────
const dbPath = path.join(__dirname, "../database/cartrace.db");
if (!fs.existsSync(dbPath)) {
  console.error("❌ Database not found. Run: node scripts/setup-db.js");
  process.exit(1);
}
const db = new Database(dbPath);

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
  secret: "cartrace-secret-2024-xK9mP2",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// ─── Auth middleware ──────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    next();
  } else {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      res.status(401).json({ success: false, message: "Not authenticated" });
    } else {
      res.redirect("/admin/login.html");
    }
  }
}

// ─── API Routes ───────────────────────────────────────────────────

// Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password required" });
  }
  const admin = db.prepare(
    "SELECT * FROM admins WHERE username = ? AND is_active = 1"
  ).get(username.trim().toLowerCase());

  if (!admin) {
    return res.json({ success: false, message: "Invalid credentials" });
  }
  const match = bcrypt.compareSync(password, admin.password_hash);
  if (!match) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  req.session.adminId = admin.id;
  req.session.adminName = admin.organization_name;
  req.session.adminRole = admin.role;

  res.json({ success: true, redirect: "/admin/dashboard.html" });
});

// Logout
app.post("/api/admin/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current admin info
app.get("/api/admin/me", requireAuth, (req, res) => {
  const admin = db.prepare(
    "SELECT id, username, organization_name, role, wallet_address, email, created_at FROM admins WHERE id = ?"
  ).get(req.session.adminId);
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
  res.json({ success: true, admin });
});

// Update wallet address
app.post("/api/admin/wallet", requireAuth, (req, res) => {
  const { walletAddress } = req.body;
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.json({ success: false, message: "Invalid wallet address" });
  }
  // Check if wallet already belongs to another admin
  const existing = db.prepare(
    "SELECT id FROM admins WHERE wallet_address = ? AND id != ?"
  ).get(walletAddress, req.session.adminId);
  if (existing) {
    return res.json({ success: false, message: "This wallet is linked to another account" });
  }
  db.prepare("UPDATE admins SET wallet_address = ? WHERE id = ?")
    .run(walletAddress, req.session.adminId);
  res.json({ success: true, message: "Wallet address updated" });
});

// Auth check (lightweight — for frontend to check session)
app.get("/api/admin/check", (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.adminId) });
});

// ─── Protected admin page routes ─────────────────────────────────
const adminPages = ["dashboard.html", "register-vehicle.html", "add-record.html"];
adminPages.forEach((page) => {
  app.get(`/admin/${page}`, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, `../public/admin/${page}`));
  });
});

// ─── Fallback: public pages ───────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/vehicle", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/vehicle.html"));
});

// ─── Start server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CarTrace server running at http://localhost:${PORT}`);
  console.log(`   Public site: http://localhost:${PORT}`);
  console.log(`   Admin login: http://localhost:${PORT}/admin/login.html\n`);
});
