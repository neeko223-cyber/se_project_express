const router = require("express").Router();

const userRouter = require("./users");
const itemsRouter = require("./clothingItem");
const NotFoundError = require("../errors/not-found-error");
const { validateLoginBody, validateUserBody } = require("../middlewares/validation");

const { login, createUser } = require("../controllers/users");
const { getItems } = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");

router.post("/signin", validateLoginBody, login);
router.post("/signup", validateUserBody, createUser);
router.get("/items", getItems);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", itemsRouter);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
