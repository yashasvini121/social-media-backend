const pool = require("../config/db");

exports.getComments = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comments");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCommentsByPostId = async (req, res) => {
  const { post_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM comments WHERE post_id = $1",
      [post_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createComment = async (req, res) => {
  const { post_id } = req.params;
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [post_id, user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23503" && error.detail.includes("user_id")) {
      res.status(409).json({ error: "User not found" });
    }
    else if (error.code === "23503") {
      res.status(404).json({ error: "Post not found" });
    }
    else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.updateComment = async (req, res) => {
  const { comment_id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (content !== undefined) {
    fields.push(`content = $${index++}`);
    values.push(content);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(comment_id);

  const query = `UPDATE comments SET ${fields.join(
    ", "
  )} WHERE comment_id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM comments WHERE comment_id = $1 RETURNING *",
      [comment_id]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      res.status(404).json({ error: "Comment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
