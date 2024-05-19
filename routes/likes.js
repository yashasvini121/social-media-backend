const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  like,
  unlike,
} = require("../controllers/likesController");

router
  .route("/")
  .post(authMiddleware, like)
  .delete(authMiddleware, unlike);

module.exports = router;
