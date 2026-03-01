require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'chitti',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kst_portal',
  password: process.env.DB_PASSWORD || 'examplepassword',
  port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
});

module.exports = pool;
