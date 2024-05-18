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

  // check if user_id is allowed to create post from this account
  // if (user_id !== req.user.user_id) {
  //   return res.status(403).json({ error: "Forbidden" });
  // }

  try {
    const result = await pool.query(
      "INSERT INTO posts (user_id, content, media_type, media_url, teacher_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, content, media_type, media_url, teacher_verified]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === "23503") {
      res.status(404).json({ error: "User not found" });
    }
    else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.updatePostById = async (req, res) => {
  const postId = req.params.id;
  const { content, media_type, media_url, teacher_verified } = req.body;

  const fields = [];
  const values = [];
  let index = 1;

  if (content !== undefined) {
    fields.push(`content = $${index++}`);
    values.push(content);
  }
  if (media_type !== undefined) {
    fields.push(`media_type = $${index++}`);
    values.push(media_type);
  }
  if (media_url !== undefined) {
    fields.push(`media_url = $${index++}`);
    values.push(media_url);
  }
  if (teacher_verified !== undefined) {
    fields.push(`teacher_verified = $${index++}`);
    values.push(teacher_verified);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(postId);

  const query = `UPDATE posts SET ${fields.join(
    ", "
  )} WHERE post_id = $${index} RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
