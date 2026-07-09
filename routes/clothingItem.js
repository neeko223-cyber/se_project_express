const router = require('express').Router();

const {
  createItem,
  likeItem,
  dislikeItem,
  deleteItem
} = require('../controllers/clothingItems');


router.post("/", createItem);
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", dislikeItem);
router.delete("/:itemId", deleteItem);


module.exports = router;