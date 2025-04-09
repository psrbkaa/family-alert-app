const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // atau password kamu
  database: 'family_alert'
});

module.exports = db;
