const pool = require('../config/db');

exports.listUsers = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'organizer', 'staff', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};
