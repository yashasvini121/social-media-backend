const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "peerverse",
  password: "postgres",
  port: 5432,
});

module.exports = pool;
