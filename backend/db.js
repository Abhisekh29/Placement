import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the pool connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection pool failed:", err);
  } else {
    console.log("Connected to MySQL via Connection Pool");
    connection.release(); // Very important: release the test connection back to the pool
  }
});