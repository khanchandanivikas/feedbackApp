const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const cloudinary = require("../utils/cloudinary");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// create new user
const createUser = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { name, userName, email, password } = req.body;
  let existeUser;
  try {
    existeUser = await User.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error("There was an error with the operation.");
    error.code = 500;
    return next(error);
  }
  if (existeUser) {
    const error = new Error("A client already exists with this e-mail.");
    error.code = 401;
    return next(error);
  } else {
    let result;
    try {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: "feedbackApp",
      });
    } catch (err) {
      const error = new Error(
        "There was some error. It was not possible to save the datas."
      );
      error.code = 500;
      return next(error);
    }
    let hashedPassword;
    hashedPassword = await bcrypt.hash(password, 12);
    const nuevoUser = new User({
      name: name,
      userName: userName,
      email: email,
      password: hashedPassword,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    });
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await nuevoUser.save({
        session: sess,
      });
      await sess.commitTransaction();
    } catch (err) {
      console.log(err)
      const error = new Error("The data could not be saved.");
      error.code = 500;
      return next(error);
    }
    let token;
    try {
      token = jwt.sign(
        {
          userId: nuevoUser.id,
          email: nuevoUser.email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
    } catch (err) {
      const error = new Error("New user could not be created");
      error.code = 500;
      return next(error);
    }
    res.status(201).json({
      userId: nuevoUser.id,
      userName: nuevoUser.userName,
      email: nuevoUser.email,
      password: nuevoUser.password,
      avatar: nuevoUser.avatar,
      cloudinary_id: nuevoUser.cloudinary_id,
      token: token,
    });
  }
};

// get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    users: users,
  });
};

// login usuario
const loginUser = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await User.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error("There was some error. It was not possible to update the datas.");
    error.code = 500;
    return next(error);
  }
  if (!usuarioExiste) {
    const error = new Error(
      "It was not possible to identify the user. Credentials error."
    );
    error.code = 422;
    return next(error);
  }
  let esValidoElPassword = false;
  try {
    esValidoElPassword = await bcrypt.compare(password, usuarioExiste.password);
  } catch (err) {
    const error = new Error(
      "It was not possible to realize the login. Revise your credentials."
    );
    error.code = 500;
    return next(error);
  }
  if (!esValidoElPassword) {
    const error = new Error(
      "It was not possible to identify the user. Credentials error."
    );
    error.code = 401;
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new Error("Login process failed");
    error.code = 500;
    return next(error);
  }
  res.json({
    userId: usuarioExiste.id,
    userName: usuarioExiste.userName,
    email: usuarioExiste.email,
    avatar: usuarioExiste.avatar,
    cloudinary_id: usuarioExiste.cloudinary_id,
    token: token,
  });
};

// recuperar usuario por su id
const getUserById = async (req, res, next) => {
  const idUser = req.params.id;
  let usuario;
  try {
    usuario = await User.findById(idUser);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!usuario) {
    const error = new Error(
      "It was not possible to recover an user with the given id"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    user: usuario,
  });
};

// eliminar user por id
const deleteUser = async (req, res, next) => {
  const idUser = req.params.id;
  let user;
  try {
    user = await User.findById(idUser);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!user) {
    const error = new Error(
      "It was not possible to recover an user with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (user.id !== req.userData.userId) {
    const error = new Error("You do not have permission to delete this user.");
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await user.remove({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to delete the datas."
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    message: "user deleted",
  });
};

exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.loginUser = loginUser;
exports.deleteUser = deleteUser;
