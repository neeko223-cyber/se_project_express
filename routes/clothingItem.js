const router = require('express').Router();
const ClothingItem = require("../models/clothingItem");
const { NOT_FOUND } = require('../utils/errors');

// Create a new clothing item
router.post('/', async (req, res) => {
  try {
    const { name, weather, imageUrl, category } = req.body;
    const newClothingItem = new ClothingItem({ name, weather, imageUrl, category, owner: req.user._id });
    await newClothingItem.save();
    res.status(201).json(newClothingItem);
  } catch (error) {
    res.status(BAD_REQUEST).json({ error: error.message });
  }
});

// Get all clothing items
router.get('/', async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find();
    res.json(clothingItems);
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

// Like an item
router.put('/:itemId/likes', async (req, res) => {
  try {
    const updatedItem = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(NOT_FOUND).json({ message: 'Item not found' });
    }

    return res.json(updatedItem);
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

// Unlike an item
router.delete('/:itemId/likes', async (req, res) => {
  try {
    const updatedItem = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(NOT_FOUND).json({ message: 'Item not found' });
    }

    return res.json(updatedItem);
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

module.exports = router;