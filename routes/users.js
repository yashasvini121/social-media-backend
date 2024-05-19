const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/usersController");

router
  .route("/")
  .get(authMiddleware, getUsers)
  .post(authMiddleware, createUser);

router
  .route("/:id")
  .get(authMiddleware, getUserById)
  .patch(authMiddleware, updateUserById)
  .delete(authMiddleware, deleteUserById);

module.exports = router;