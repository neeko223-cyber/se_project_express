const router = require("express").Router();
const { getUsers, createUser } = require("../controllers/users")

router.get("/", getUsers);
router.get("/userID", () => console.log("GET users by ID"));
router.post("/", createUser);

module.exports = router;