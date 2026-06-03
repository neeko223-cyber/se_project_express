const router = require('express').Router();
const mongoose = require('mongoose');
const ClothingItem = require("../models/clothingItem");
const { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST, } = require('../utils/errors');

// Create a new clothing item
router.post('/', async (req, res) => {
  try {
    const { name, weather, imageUrl, category } = req.body;

    const newClothingItem = await ClothingItem.create({
      name,
      weather,
      imageUrl,
      category,
      owner: req.user._id,
    });

    return res.status(201).json(newClothingItem);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(BAD_REQUEST).json({ message: error.message });
    }

    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
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
    if (error.name === 'CastError') {
      return res.status(BAD_REQUEST).json({ message: 'Invalid item ID' });
    }

    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
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
    if (error.name === 'CastError') {
      return res.status(BAD_REQUEST).json({ message: 'Invalid item ID' });
    }

    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
});

// Delete an item
router.delete('/:itemId', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return res.status(BAD_REQUEST).json({ message: 'Invalid item ID' });
  }

  try {
    const item = await ClothingItem.findById(req.params.itemId);

    if (!item) {
      return res.status(NOT_FOUND).json({ message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id) {
      return res.status(403).json({
      message: "You do not have permission to delete this item",
      });
    }

    await item.deleteOne();

    return res.json(item);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(BAD_REQUEST).json({ message: 'Invalid item ID' });
    }

    return res
      .status(INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
});

module.exports = router;