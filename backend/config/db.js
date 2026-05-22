const mysql = require('mysql2/promise');
require('dotenv').config();

const DB = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || 'passmaster';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'organizer', 'staff', 'buyer') DEFAULT 'buyer',
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  ticket_price DECIMAL(10, 2) NOT NULL,
  status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_events_status (status),
  INDEX idx_events_date (date)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  buyer_id INT NOT NULL,
  unique_code VARCHAR(36) UNIQUE NOT NULL,
  status ENUM('active', 'used', 'cancelled', 'refunded') DEFAULT 'active',
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checked_in_at TIMESTAMP NULL,
  checked_in_by INT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_tickets_buyer (buyer_id),
  INDEX idx_tickets_event_status (event_id, status),
  INDEX idx_tickets_checked_in_by (checked_in_by)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  buyer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_transactions_ticket (ticket_id),
  INDEX idx_transactions_buyer (buyer_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

async function autoMigrate() {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'events'",
      [DB]
    );
    if (rows[0].cnt === 0) {
      console.log('⚙️ Ejecutando migración inicial...');
      await conn.query(SCHEMA_SQL);
      console.log('✅ Base de datos inicializada');
    }
    conn.release();
  } catch (err) {
    console.error('⚠️ Error en migración automática:', err.message);
  }
}

autoMigrate();

module.exports = pool;
