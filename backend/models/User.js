const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ name, email, password, role = 'buyer' }) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  },
};

module.exports = User;
