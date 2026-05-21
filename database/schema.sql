CREATE DATABASE IF NOT EXISTS passmaster
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE passmaster;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'organizer', 'staff', 'buyer') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE events (
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

CREATE TABLE tickets (
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

CREATE TABLE transactions (
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
