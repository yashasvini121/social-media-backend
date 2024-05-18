const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/usersController");

router.route("/").get(getUsers).post(createUser).patch(updateUser);

router.route("/:id").get(getUserById).put(updateUserById).delete(deleteUserById);

module.exports = router;