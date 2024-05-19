const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, email, first_name, last_name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(username, email, first_name, last_name, hashedPassword);

    if(!username || !email || !first_name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newUser = await pool.query(
      "INSERT INTO users (username, email, first_name, last_name, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, email, first_name, last_name, hashedPassword]
    );

    const token = jwt.sign({ user_id: newUser.rows[0].user_id }, "yashasvini", {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!user.rows.length)
      return res.status(400).json({ message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      "yashasvini",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};