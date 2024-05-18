const pool = require("../config/db");

exports.likePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({ error: "Missing post_id or user_id" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
      [post_id, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "User has already liked this post" });
    }
    else if (error.code === "23503") {
      res.status(404).json({ error: "User not found" });
    }
    else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.unlikePost = async (req, res) => {
  const { post_id, user_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({ error: "Missing post_id or user_id" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *",
      [post_id, user_id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Like not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(404).json({ error: "User has already unliked this post" });
    }
    else if (error.code === "23503") {
      res.status(404).json({ error: "user not found" });
    }
    else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.likeComment = async (req, res) => {
  const { comment_id, user_id } = req.body;

  if (!comment_id || !user_id) {
    return res.status(400).json({ error: "Missing comment_id or user_id" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO likes (comment_id, user_id) VALUES ($1, $2) RETURNING *",
      [comment_id, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "User has already liked this comment" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

exports.unlikeComment = async (req, res) => {
  const { comment_id, user_id } = req.body;

  if (!comment_id || !user_id) {
    return res.status(400).json({ error: "Missing comment_id or user_id" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM likes WHERE comment_id = $1 AND user_id = $2 RETURNING *",
      [comment_id, user_id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Like not found" });
    }
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "User has already unliked this comment" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};