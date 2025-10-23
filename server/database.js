const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'multipanel.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance REAL DEFAULT 0,
    is_admin BOOLEAN DEFAULT 0,
    is_blocked BOOLEAN DEFAULT 0,
    referred_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    duration_value INTEGER NOT NULL,
    duration_unit TEXT NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variant_id INTEGER NOT NULL,
    key_value TEXT NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_by INTEGER,
    used_at DATETIME,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    key_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (key_id) REFERENCES product_keys(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 0,
    is_used BOOLEAN DEFAULT 0,
    created_by INTEGER NOT NULL,
    used_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (used_by) REFERENCES users(id)
  );
`);

// Check if we need to migrate old schema
const tableInfo = db.prepare("PRAGMA table_info(products)").all();
const hasPriceColumn = tableInfo.some(col => col.name === 'price');

// Check if variant table exists
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_variants'").all();
const variantTableExists = tables.length > 0;

if (hasPriceColumn && !variantTableExists) {
  console.log('Migrating old schema to new variant-based schema...');
  
  // Get all existing products
  const oldProducts = db.prepare('SELECT * FROM products').all();
  const oldKeys = db.prepare('SELECT * FROM product_keys').all();
  const oldPurchases = db.prepare('SELECT * FROM purchases').all();
  
  // Drop old tables
  db.exec(`
    DROP TABLE IF EXISTS purchases;
    DROP TABLE IF EXISTS product_keys;
    DROP TABLE IF EXISTS products;
  `);
  
  // Recreate new schema tables
  db.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      duration_value INTEGER NOT NULL,
      duration_unit TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE product_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id INTEGER NOT NULL,
      key_value TEXT NOT NULL,
      is_used BOOLEAN DEFAULT 0,
      used_by INTEGER,
      used_at DATETIME,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
      FOREIGN KEY (used_by) REFERENCES users(id)
    );

    CREATE TABLE purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL,
      key_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id),
      FOREIGN KEY (key_id) REFERENCES product_keys(id)
    );
  `);
  
  // Migrate data
  const insertProduct = db.prepare('INSERT INTO products (id, name, description, created_at) VALUES (?, ?, ?, ?)');
  const insertVariant = db.prepare('INSERT INTO product_variants (product_id, duration_value, duration_unit, price) VALUES (?, ?, ?, ?)');
  const insertKey = db.prepare('INSERT INTO product_keys (variant_id, key_value, is_used, used_by, used_at) VALUES (?, ?, ?, ?, ?)');
  const insertPurchase = db.prepare('INSERT INTO purchases (user_id, variant_id, key_id, amount, purchased_at) VALUES (?, ?, ?, ?, ?)');
  
  const productVariantMap = {}; // Map old product_id to new variant_id
  
  for (const product of oldProducts) {
    insertProduct.run(product.id, product.name, product.description, product.created_at);
    
    // Parse duration (e.g., "30 days" or "1 month")
    const durationParts = product.duration.split(' ');
    const durationValue = parseInt(durationParts[0]);
    const durationUnit = durationParts[1] || 'days';
    
    const variantResult = insertVariant.run(product.id, durationValue, durationUnit, product.price);
    productVariantMap[product.id] = variantResult.lastInsertRowid;
  }
  
  // Migrate keys
  for (const key of oldKeys) {
    const variantId = productVariantMap[key.product_id];
    if (variantId) {
      insertKey.run(variantId, key.key_value, key.is_used, key.used_by, key.used_at);
    }
  }
  
  // Migrate purchases
  for (const purchase of oldPurchases) {
    const variantId = productVariantMap[purchase.product_id];
    if (variantId) {
      insertPurchase.run(purchase.user_id, variantId, purchase.key_id, purchase.amount, purchase.purchased_at);
    }
  }
  
  console.log('Migration completed successfully!');
}

const checkAdminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').get();
if (checkAdminExists.count === 0) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)')
    .run('admin', hashedPassword);
  console.log('Default admin created: username=admin, password=admin123');
}

module.exports = db;
