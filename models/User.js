const pool = require("../config/db");
class User {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(result.rows);
    return result.rows[0];
  };

  static async getAll() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  };

    static async create(username, email, first_name, password) {
      try {
        console.log(username, email, first_name, password);
      const result = await pool.query(
        "INSERT INTO users (username, email, first_name, last_name, password) VALUES ($1, $2, $3, 'john', $4)",
        [username, email, first_name, password]
      );
      return { user: result.rows[0], error: null };
    } catch (error) {
      if (error.code === "23505") {
        return { user: null, error: "Username or email already exists" };
      }
      throw error;
    }
  };
};

module.exports = User;
