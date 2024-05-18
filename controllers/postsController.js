const pool = require("../config/db");

exports.getPosts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createPost = async (req, res) => {
  const { user_id, content, media_type, media_url, teacher_verified } =
    req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const result = await pool.query(
      "INSERT INTO posts (user_id, content, media_type, media_url, teacher_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, content, media_type, media_url, teacher_verified]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
