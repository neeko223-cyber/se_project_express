const ClothingItem = require('../models/ClothingItem');

const createItem = (req, res) => {
  console.log(req.user._id);
  console.log(req.body)
  const { name, weather, imageUrl, category } = req.body;

  ClothingItem.create({ name, weather, imageUrl, category, owner: req.user._id })
    .then(item => res.status(201).json(item))
    .catch(err => res.status(400).json({ error: err.message }));
}