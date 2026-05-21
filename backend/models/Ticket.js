const pool = require('../config/db');

const Ticket = {
  async create({ event_id, buyer_id, unique_code }) {
    const [result] = await pool.execute(
      'INSERT INTO tickets (event_id, buyer_id, unique_code) VALUES (?, ?, ?)',
      [event_id, buyer_id, unique_code]
    );
    return result.insertId;
  },

  async findByCode(code) {
    const [rows] = await pool.execute(
      `SELECT t.*, e.name AS event_name, e.date AS event_date, e.location AS event_location
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.unique_code = ?`,
      [code]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, e.name AS event_name, e.date AS event_date, e.location AS event_location
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByBuyer(buyerId) {
    const [rows] = await pool.execute(
      `SELECT t.*, e.name AS event_name, e.date AS event_date, e.location AS event_location
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.buyer_id = ?
       ORDER BY t.purchase_date DESC`,
      [buyerId]
    );
    return rows;
  },

  async findByEvent(eventId) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.name AS buyer_name, u.email AS buyer_email
       FROM tickets t
       JOIN users u ON t.buyer_id = u.id
       WHERE t.event_id = ?
       ORDER BY t.purchase_date DESC`,
      [eventId]
    );
    return rows;
  },

  async checkIn(ticketId, staffId) {
    await pool.execute(
      'UPDATE tickets SET status = "used", checked_in_at = NOW(), checked_in_by = ? WHERE id = ?',
      [staffId, ticketId]
    );
  },

  async cancel(id) {
    await pool.execute('UPDATE tickets SET status = "cancelled" WHERE id = ?', [id]);
  },
};

module.exports = Ticket;
