require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DB_PASSWORD) {
  console.warn('⚠️  Warning: DB_PASSWORD environment variable is not set. Database connection may fail.');
}

const pool = new Pool({
  user: process.env.DB_USER || 'chitti',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kst_portal',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

module.exports = pool;
