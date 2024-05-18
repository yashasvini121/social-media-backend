const pool = require("../config/db");

exports.like = async (req, res) => {
  const { user_id, post_id, comment_id } = req.body;

  if (!user_id || (!post_id && !comment_id)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let query, values;

    if (post_id) {
      query =
        "INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *";
      values = [user_id, post_id];
    } else if (comment_id) {
      query =
        "INSERT INTO likes (user_id, comment_id) VALUES ($1, $2) RETURNING *";
      values = [user_id, comment_id];
    }

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "Already liked" });
    }
    else if (error.code === "23503" && error.constraint === "likes_post_id_fkey") {
      res.status(404).json({ error: "Post not found" });
    }
    else if (error.code === "23503" && error.constraint === "likes_comment_id_fkey") {
      res.status(404).json({ error: "Comment not found" });
    }
    else if (error.code === "23503" && error.constraint === "likes_user_id_fkey") {
      res.status(404).json({ error: "User not found" });
    }
    else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.unlike = async (req, res) => {
  const { user_id, post_id, comment_id } = req.body;

  if (!user_id || (!post_id && !comment_id)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let query, values;

    if (post_id) {
      query =
        "DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *";
      values = [user_id, post_id];
    } else if (comment_id) {
      query =
        "DELETE FROM likes WHERE user_id = $1 AND comment_id = $2 RETURNING *";
      values = [user_id, comment_id];
    }

    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Like not found" });
    }
  } catch (error) {   // TODO: Add proper error handing here
    console.error(error);
    if (error.code === "23505") {
      res.status(409).json({ error: "User has already unliked this comment" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
