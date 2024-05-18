const pool = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, first_name, last_name, password } = req.body;

  if (!username || !email || !first_name || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (username, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, first_name, last_name, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.updateUser = async (req, res) => {
  const { user_id, username, email, first_name, last_name, password } =
    req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, password = $5 WHERE user_id = $6 RETURNING *",
      [username, email, first_name, last_name, password, user_id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found. Enter a valid user ID." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateUserById = async (req, res) => {
  const userId = req.params.id;
  const { username, email, first_name, last_name, password } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET 
                username = COALESCE($1, username), 
                email = COALESCE($2, email), 
                first_name = COALESCE($3, first_name), 
                last_name = COALESCE($4, last_name), 
                password = COALESCE($5, password) 
            WHERE user_id = $6 RETURNING *`,
      [username, email, first_name, last_name, password, userId]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" })
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.deleteUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM users WHERE user_id = $1", [
      userId,
    ]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" })
  }
};