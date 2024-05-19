const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  getPosts,
  createPost,
  updatePostById,
  deletePostById,
} = require("../controllers/postsController");

router
  .route("/")
  .get(authMiddleware, getPosts)
  .post(authMiddleware, createPost);

router
  .route("/:id")
  .patch(authMiddleware, updatePostById)
  .delete(authMiddleware, deletePostById);

module.exports = router;
