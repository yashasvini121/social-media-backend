const express = require("express");
const router = express.Router();
const {
  like,
  unlike,
} = require("../controllers/likesController");

router.route("/").post(like).delete(unlike);

module.exports = router;
