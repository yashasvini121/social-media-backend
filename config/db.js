require("dotenv").config();
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database at", res.rows[0].now);
  }
});

module.exports = pool;
