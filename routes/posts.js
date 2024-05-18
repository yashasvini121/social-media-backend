const express = require("express");
const router = express.Router();
const {
  getPosts,
  createPost,
  updatePostById,
} = require("../controllers/postsController");

router.route("/").get(getPosts).post(createPost);
router.route("/:id").patch(updatePostById);

module.exports = router;
