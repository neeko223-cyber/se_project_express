const router = require('express').Router();

const { getItems, createItem, likeItem, dislikeItem, deleteItem } = require('../controllers/clothingitems');

router.get('/items', getItems);
router.post('/items', createItem);
router.put('/items/:itemId/likes', likeItem);
router.delete('/items/:itemId/likes', dislikeItem);
router.delete('/items/:itemId', deleteItem);


module.exports = router;