const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  CONFLICT,
 } = require("../utils/errors");


const { JWT_SECRET } = require("../utils/config");

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).send({ token });
    })
    .catch(() =>
      res.status(401).send({
        message: "Incorrect email or password",
      })
    );
};

// GET /users
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error occurred on the server",
      });
    });
};

// POST /users
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  return bcrypt.genSalt(10, (hashErr, salt) => {
    if (hashErr) {
      console.error(hashErr);
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "An error occurred on the server" });
    }

    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(INTERNAL_SERVER_ERROR).send({ message: "An error occurred on the server" });
      }

    return User.create({ name, avatar, email, password: hash })
      .then((user) => {
        const userObj = user.toObject();

        delete userObj.password;

        return res.status(201).send(userObj);
      })
      .catch((dbErr) => {
        console.error(dbErr);
        if (dbErr.name === "ValidationError") {
          return res.status(BAD_REQUEST).send({ message: dbErr.message });
        }
        if (dbErr.code === 11000) {
          return res.status(CONFLICT).send({ message: "Email already exists" });
        }
        return res.status(INTERNAL_SERVER_ERROR).send({ message: dbErr.message });
      });
    });
  });
};

// GET /users/me
const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      const error = new Error("User not found");
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user ID format" });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error occurred on the server",
      });
    });
};

// PATCH /users/me
const updateCurrentUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => {
      const error = new Error("User not found");
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      }

      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(BAD_REQUEST).send({
          message: "Invalid user data",
        });
      }

      return res.status(INTERNAL_SERVER_ERROR).send({
        message: "An error occurred on the server",
      });
    });
};

module.exports = { getUsers, createUser, getCurrentUser, login, updateCurrentUser, };