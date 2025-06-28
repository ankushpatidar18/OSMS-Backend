const mysql = require('mysql2');
require('dotenv').config();

['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Environment variable ${key} is not set.`);
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.promise().getConnection();
    console.log('Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}
testConnection();


const db = pool.promise();

module.exports = db;
