const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "user_management",
  password: process.env.DB_PASSWORD || "Nuclear012$",
  port: process.env.DB_PORT || 5432,
});

pool.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Connected to the PostgreSQL database!");
  }
});

module.exports = pool;