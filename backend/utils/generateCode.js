const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function generateUniqueCode() {
  const raw = uuidv4() + Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32).toUpperCase();
}

function generateShortCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

module.exports = { generateUniqueCode, generateShortCode };
