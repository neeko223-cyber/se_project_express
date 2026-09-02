const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/bad-request-error");
const UnauthorizedError = require("../errors/unauthorized-error");
const NotFoundError = require("../errors/not-found-error");
const ConflictError = require("../errors/conflict-error");

const { JWT_SECRET } = require("../utils/config");

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(200).send({ token });
    })
    .catch(() => next(new UnauthorizedError("Incorrect email or password")));
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  return bcrypt.genSalt(10, (hashErr, salt) => {
    if (hashErr) {
      return next(hashErr);
    }

    return bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      return User.create({ name, avatar, email, password: hash })
        .then((user) => {
          const userObj = user.toObject();

          delete userObj.password;

          return res.status(201).send(userObj);
        })
        .catch((dbErr) => {
          if (dbErr.name === "ValidationError") {
            return next(new BadRequestError(dbErr.message));
          }
          if (dbErr.code === 11000) {
            return next(new ConflictError("Email already exists"));
          }
          return next(dbErr);
        });
    });
  });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      const error = new Error("User not found");
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError(err.message));
      }

      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID format"));
      }

      return next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }

      if (err.name === "ValidationError" || err.name === "CastError") {
        return next(new BadRequestError("Invalid user data"));
      }

      return next(err);
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
