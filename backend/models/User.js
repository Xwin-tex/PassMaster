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

  async update(id, data) {
    const fields = [];
    const params = [];
    if (data.name) { fields.push('name = ?'); params.push(data.name); }
    if (data.email) { fields.push('email = ?'); params.push(data.email); }
    if (data.password) {
      const hashed = await bcrypt.hash(data.password, 10);
      fields.push('password = ?');
      params.push(hashed);
    }
    if (fields.length === 0) return;
    params.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async setResetToken(email, token, expires) {
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );
  },

  async findByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0];
  },
};

module.exports = User;
