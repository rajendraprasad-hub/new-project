const { Pool } = require('pg');

const pool = new Pool({
  user: 'chitti',
  host: 'localhost', // Local machine
  database: 'kst_portal',
  password: 'examplepassword',
  port: 5432,
});

module.exports = pool;
