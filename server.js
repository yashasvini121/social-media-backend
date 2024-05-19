const express = require("express");
const jwt = require("jsonwebtoken");
const port = 3000;
const bodyParser = require("./middlewares/bodyParser");
const authController = require("./controllers/authController");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");

const app = express();

// Middleware
app.use(bodyParser);

// Routes
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
