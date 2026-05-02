const ClothingItem = require("../models/clothingItem");
const { INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = require("../utils/errors");

const createItem = (req, res) => {
  console.log(req.user._id);
  console.log(req.body)
  const { name, weather, imageUrl, category } = req.body;

  ClothingItem.create({ name, weather, imageUrl, category, owner: req.user._id })
    .then(item => res.status(201).json(item))
    .catch(err => res.status(400).json({ message: err.message }));

};

const getItems = (req, res) => {
  ClothingItem.find()
    .then(items => res.json(items))
    .catch(err => res.status(500).json({ message: err.message }));
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      return res.status(200).json({ message: "Item deleted" });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      return res.status(500).json({ message: "An error has occurred on the server" });
    });
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      return res
        .status(500)
        .json({ message: "Server error" });
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      return res
        .status(500)
        .json({ message: "Server error" });
    });
};


module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem
};