const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  getComments,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentsController");

router.route("/").get(authMiddleware, getComments);

router
  .route("/post/:post_id/")
  .get(authMiddleware, getCommentsByPostId)
  .post(authMiddleware, createComment);

router
  .route("/:comment_id")
  .patch(authMiddleware, updateComment)
  .delete(authMiddleware, deleteComment);

module.exports = router;
