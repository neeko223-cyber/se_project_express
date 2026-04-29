const router = require('express').Router();
const ClothingItem = require('../models/clothingitem');

// Create a new clothing item
router.post('/', async (req, res) => {
  try {
    const { name, weather, imageUrl, category } = req.body;
    const newClothingItem = new ClothingItem({ name, weather, imageUrl, category });
    await newClothingItem.save();
    res.status(201).json(newClothingItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all clothing items
router.get('/', async (req, res) => {
  try {
    const clothingItems = await ClothingItem.find();
    res.json(clothingItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;