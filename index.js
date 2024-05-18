const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Database connection setup
const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "peerverse",
	password: "postgres",
	port: 5432,
});

// Middleware
app.use(bodyParser.json());


// API endpoints for users
app
	.route("/api/users")
	.get(async (req, res) => {
		try {
			const result = await pool.query("SELECT * FROM users");
			res.status(200).json(result.rows);
		} catch (error) {
			console.error(error);
			res.status(500).send("Internal Server Error");
		}
	})
	.post(async (req, res) => {
		const { username, email, first_name, last_name, password } = req.body;

		if (!username || !email || !first_name || !password) {
			return res.status(400).send("Missing required fields");
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
				// Unique violation
				res.status(409).send("Username or email already exists");
			} else {
				res.status(500).send("Internal Server Error");
			}
		}
	})
	.patch(async (req, res) => {
		const { user_id } = req.body;
		const { username, email, first_name, last_name, password } = req.body;

		if (!user_id) {
			return res.status(400).send("Missing user_id");
		}

		try {
			const result = await pool.query(
				"UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, password = $5 WHERE user_id = $6 RETURNING *",
				[username, email, first_name, last_name, password, user_id]
			);
			if (result.rows.length > 0) {
				res.status(200).json(result.rows[0]);
			} else {
				res.status(404).send("User not found");
			}
		} catch (error) {
			console.error(error);
			if (error.code === "23505") {
				// Unique violation
				res.status(409).send("Username or email already exists");
			} else {
				res.status(500).send("Internal Server Error");
			}
		}
	}
	);


// API endpoints for user profile using user_id
app
	.route('/api/users/:id')
	.get(async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).send('User not found. Enter a valid user ID.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
	})
	.put(async (req, res) => {
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
							res.status(404).send('User not found');
					}
			} catch (error) {
					console.error(error);
					if (error.code === '23505') { // Unique violation
							res.status(409).send('Username or email already exists');
					} else {
							res.status(500).send('Internal Server Error');
					}
			}
	});



// API endpoints for posts
app
	.route('/api/posts')
	.get(async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
	})
	.post(async (req, res) => {
    const { user_id, content, media_type, media_url, teacher_verified } = req.body;

    if (!user_id || !content) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, content, media_type, media_url, teacher_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, content, media_type, media_url, teacher_verified]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// API endpoints for likes
app
	.route("/api/posts/:post_id/like")
	.post(async (req, res) => {
		const { post_id } = req.params;
		const { user_id } = req.body;

		if (!user_id) {
			return res.status(400).send("Missing user_id");
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
				// Unique violation
				res.status(409).send("User has already liked this post");
			} else {
				res.status(500).send("Internal Server Error");
			}
		}
	})
	// Dislike a post endpoint
	.delete(async (req, res) => {
			const { post_id } = req.params;
			const { user_id } = req.body;

			if (!user_id) {
					return res.status(400).send('Missing user_id');
			}

			try {
					const result = await pool.query(
							'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *',
							[post_id, user_id]
					);
					if (result.rows.length > 0) {
							res.status(200).json(result.rows[0]);
					} else {
							res.status(404).send('Like not found');
					}
			} catch (error) {
					console.error(error);
					res.status(500).send('Internal Server Error');
			}
	});


// API endpoints for comments 
app
	.route("/api/posts/:post_id/comments")
	.get(async (req, res) => {
		const { post_id } = req.params;
		
		try {
			const result = await pool.query(
				'SELECT * FROM comments WHERE post_id = $1',
				[post_id]
			);
			res.status(200).json(result.rows);
		} catch (error) {
			console.error(error);
			res.status(500).send('Internal Server Error');
		}
	})
	.post(async (req, res) => {
    const { post_id } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const result = await pool.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [post_id, user_id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
	})
	.put(async (req, res) => {
    const { comment_id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).send('Missing content');
    }

    try {
        const result = await pool.query(
            'UPDATE comments SET content = $1 WHERE comment_id = $2 RETURNING *',
            [content, comment_id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).send('Comment not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
	})
	.delete(async (req, res) => {
    const { comment_id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM comments WHERE comment_id = $1 RETURNING *',
            [comment_id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).send('Comment not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
	});

// Start the server
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
