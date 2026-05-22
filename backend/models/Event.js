const pool = require('../config/db');

const Event = {
  async create({ organizer_id, name, description, date, location, capacity, ticket_price, media }) {
    const [result] = await pool.execute(
      `INSERT INTO events (organizer_id, name, description, date, location, capacity, ticket_price, media)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizer_id, name, description, date, location, capacity, ticket_price, media ? JSON.stringify(media) : null]
    );
    return result.insertId;
  },

  async findAll(filters = {}) {
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.organizer_id) {
      sql += ' AND organizer_id = ?';
      params.push(filters.organizer_id);
    }
    if (filters.search) {
      sql += ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY date DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    for (const key of ['name', 'description', 'date', 'location', 'capacity', 'ticket_price', 'status']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (data.media !== undefined) {
      fields.push('media = ?');
      params.push(JSON.stringify(data.media));
    }
    if (fields.length === 0) return;
    params.push(id);
    await pool.execute(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async getSoldCount(eventId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM tickets WHERE event_id = ? AND status IN ("active", "used")',
      [eventId]
    );
    return rows[0].count;
  },
};

module.exports = Event;
