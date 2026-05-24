const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '123456',
  database: 'pengaduan_db',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;