const pool = require('../config/db');

const Transaction = {
  async create({ ticket_id, buyer_id, amount, payment_method, payment_status, payment_id }) {
    const [result] = await pool.execute(
      `INSERT INTO transactions (ticket_id, buyer_id, amount, payment_method, payment_status, payment_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ticket_id, buyer_id, amount, payment_method, payment_status, payment_id]
    );
    return result.insertId;
  },

  async findByBuyer(buyerId) {
    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE buyer_id = ? ORDER BY created_at DESC',
      [buyerId]
    );
    return rows;
  },

  async updateStatus(id, status, paymentId) {
    await pool.execute(
      'UPDATE transactions SET payment_status = ?, payment_id = ? WHERE id = ?',
      [status, paymentId, id]
    );
  },
};

module.exports = Transaction;
