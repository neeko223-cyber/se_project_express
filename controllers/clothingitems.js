const ClothingItem = require("../models/clothingItem");
const { INTERNAL_SERVER_ERROR, BAD_REQUEST } = require("../utils/errors");

const createItem = (req, res) => {
  console.log(req.user._id);
  console.log(req.body)
  const { name, weather, imageUrl, category } = req.body;

  ClothingItem.create({ name, weather, imageUrl, category, owner: req.user._id })
    .then(item => res.status(201).json(item))
    .catch(err => res.status(BAD_REQUEST).json({ message: err.message }));

};

const getItems = (req, res) => {
  ClothingItem.find()
    .then(items => res.json(items))
    .catch(err => res.status(INTERNAL_SERVER_ERROR).json({ message: err.message }));
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        return res.status(BAD_REQUEST).json({ message: "Item not found" });
      }

      // Check if the current user owns the item
      if (item.owner.toString() !== req.user._id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return ClothingItem.findByIdAndDelete(itemId)
        .then(() => res.status(200).json({ message: "Item deleted" }));
    })
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).json({ message: err.message }));
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
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
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    });
};

const deleteItem = (req, res) => {
  ClothingItem.findByIdAndDelete(req.params.itemId)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
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