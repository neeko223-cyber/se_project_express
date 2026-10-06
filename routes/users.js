const router = require("express").Router();
const {
  getUsers,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");
const { validateUpdateUser } = require("../middlewares/validation");

router.get("/", getUsers);
router.get("/me", getCurrentUser);
router.patch("/me", validateUpdateUser, updateCurrentUser);

module.exports = router;