const router = require("express").Router();
const {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
} = require("../controllers/users");

// GET /users - get all users
router.get("/", getUsers);

// GET /users/me - get current user (this is the new route!)
router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);

module.exports = router;