const ClothingItem = require("../models/clothingItem");

const createItem = (req, res) => {
  console.log(req.user._id);
  console.log(req.body)
  const { name, weather, imageUrl, category } = req.body;

  ClothingItem.create({ name, weather, imageUrl, category, owner: req.user._id })
    .then(item => res.status(201).json(item))
    .catch(err => res.status(400).json({ error: err.message }));

};

const getItems = (req, res) => {
  ClothingItem.find()
    .then(items => res.json(items))
    .catch(err => res.status(500).json({ error: err.message }));
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if the current user owns the item
      if (item.owner.toString() !== req.user._id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return ClothingItem.findByIdAndDelete(itemId)
        .then(() => res.status(200).json({ message: "Item deleted" }));
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
    { new: true },
  )
    .then((item) => res.status(200).json(item))
    .catch((err) => res.status(500).json({ error: err.message }));
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } }, // remove _id from the array
    { new: true },
  )
    .then((item) => res.status(200).json(item))
    .catch((err) => res.status(500).json({ error: err.message }));
};



module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem
};