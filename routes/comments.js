const express = require("express");
const router = express.Router();
const {
  getComments,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentsController");

router.route("/").get(getComments);
router.route("/post/:post_id/").get(getCommentsByPostId).post(createComment);
router.route("/:comment_id").patch(updateComment).delete(deleteComment);

module.exports = router;
