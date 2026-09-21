const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "../database");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, "cartrace.db"));

// Create the admins table
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('garage', 'inspection', 'oem', 'dealer')),
    wallet_address TEXT UNIQUE,
    email TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed demo admin accounts
const admins = [
  {
    username: "garage_centrale",
    password: "admin123",
    organization_name: "Garage Centrale Tunis",
    role: "garage",
    email: "contact@garage-centrale.tn"
  },
  {
    username: "inspect_auto",
    password: "admin123",
    organization_name: "Centre Inspection Auto",
    role: "inspection",
    email: "info@inspection-auto.tn"
  },
  {
    username: "toyota_tn",
    password: "admin123",
    organization_name: "Toyota Tunisia",
    role: "oem",
    email: "fleet@toyota.tn"
  }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO admins (username, password_hash, organization_name, role, email)
  VALUES (?, ?, ?, ?, ?)
`);

for (const admin of admins) {
  const hash = bcrypt.hashSync(admin.password, 10);
  insert.run(admin.username, hash, admin.organization_name, admin.role, admin.email);
}

console.log("✅ Database ready at database/cartrace.db");
console.log("\n─── Demo Admin Accounts ────────────────────────────────────────");
console.log("Username: garage_centrale   Password: admin123  Role: Garage");
console.log("Username: inspect_auto      Password: admin123  Role: Inspection");
console.log("Username: toyota_tn         Password: admin123  Role: OEM");
console.log("\nNote: After connecting MetaMask, update the wallet_address in the dashboard.");

db.close();
