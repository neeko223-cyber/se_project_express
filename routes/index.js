const router = require("express").Router();

const userRouter = require("./users");
const itemsRouter = require("./clothingItem");

router.use("/users", userRouter);
router.use("/items", itemsRouter);
router.use((req, res) => res.status(NOT_FOUND).send({ message: 'Requested resource not found' }));

module.exports = router;