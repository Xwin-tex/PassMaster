const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'passmaster',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

async function autoMigrate() {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'events'",
      [process.env.DB_NAME || 'passmaster']
    );
    if (rows[0].cnt === 0) {
      console.log('⚙️ Ejecutando migración inicial...');
      const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await conn.query(sql);
      console.log('✅ Base de datos inicializada');
    }
    conn.release();
  } catch (err) {
    console.error('⚠️ Error en migración automática:', err.message);
  }
}

autoMigrate();

module.exports = pool;
