const ClothingItem = require("../models/clothingItem");
const {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
  ITEM_EXISTS_BUT_USER_DOESNT_OWN_IT,
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl, category } = req.body;

  ClothingItem.create({ name, weather, imageUrl, category, owner: req.user._id })
    .then(item => res.status(201).json(item))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: "An error has occurred on the server" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find()
    .then((items) => res.json(items))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).json({ message: err.message }));
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  return ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({
          message: "Item not found"
        });
      }

      if (item.owner.toString() !== req.user._id) {
        return res.status(403).json({
          message: "You do not have permission to delete this item"
        });
      }
      return ClothingItem.findByIdAndDelete(itemId)
        .then(() =>
          res.status(200).json({
            message: "Item deleted",
          })
        );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID" });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: "An error has occurred on the server" });
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


module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};