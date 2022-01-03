const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/user");
const Feedback = require("../models/feedback");

// recuperar todos los feedbacks
const getAllFeedbacks = async (req, res, next) => {
  let feedbacks;
  try {
    feedbacks = await Feedback.find().populate("creator");
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!feedbacks) {
    const error = new Error("The data could not be recovered.");
    error.code = 404;
    return next(error);
  }
  res.json({
    feedbacks: feedbacks,
  });
};

// crear nuevo feedback
const createFeedback = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { title, category, details, creator } = req.body;
  const nuevoFeedback = new Feedback({
    title: title,
    category: category,
    details: details,
    creator: creator,
  });
  let usuarioRelacionado;
  try {
    usuarioRelacionado = await User.findById(creator).populate("feedbacks");
  } catch (error) {
    const err = new Error("Feedback creation process failed.");
    err.code = 500;
    return next(err);
  }
  if (!usuarioRelacionado) {
    const error = new Error(
      "It was not possible to find an user with the given id."
    );
    error.code = 404;
    return next(error);
  }
  // if (usuarioRelacionado.id !== req.userData.userId) {
  //   const err = new Error("You do not have permission to create this feedback.");
  //   err.code = 401;
  //   return next(err);
  // }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoFeedback.save({
      session: sess,
    });
    usuarioRelacionado.feedbacks.push(nuevoFeedback);
    await usuarioRelacionado.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    const err = new Error("The data could not be saved.");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    feedback: nuevoFeedback,
  });
};

// recuperar feedback por su id
const getFeedbackById = async (req, res, next) => {
  const idFeedback = req.params.id;
  let feedback;
  try {
    feedback = await Feedback.findById(idFeedback);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given id"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    feedback: feedback,
  });
};

// recuperar feedback por su category
const getFeedbackByCategory = async (req, res, next) => {
  const category = req.params.category;
  let feedback;
  try {
    feedback = await Feedback.find({ category: { $eq: category } });
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given category"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    feedbacks: feedback,
  });
};

// recuperar feedback por su status
const getFeedbackByStatus = async (req, res, next) => {
  const status = req.params.status;
  let feedback;
  try {
    feedback = await Feedback.find({ status: { $eq: status } });
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given status"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    feedbacks: feedback,
  });
};

// eliminar feedback por id
const deleteFeedback = async (req, res, next) => {
  const idFeedback = req.params.id;
  let feedback;
  try {
    feedback = await Feedback.findById(idFeedback).populate("creator");
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (feedback.creator.id !== req.userData.userId) {
    const error = new Error(
      "You do not have permission to delete this feedback."
    );
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await feedback.remove({
      session: sess,
    });
    await feedback.creator.feedbacks.pull(feedback);
    await feedback.creator.save({
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
    message: "Feedback deleted",
  });
};

// increment feedback
const incrementFeedback = async (req, res, next) => {
  const idFeedback = req.params.fid;
  const idUserLike = req.params.uid;
  let feedback;
  try {
    feedback = await Feedback.findById(idFeedback);
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to update the datas."
    );
    err.code = 500;
    return next(err);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given id"
    );
    error.code = 404;
    return next(error);
  }
  feedback.votes = feedback.votes + 1;
  feedback.likes = [...feedback.likes, idUserLike];
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await feedback.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to save the updated datas."
    );
    err.code = 500;
    return next(err);
  }
  res.json({
    feedback,
  });
};

// decrement feedback
const decrementFeedback = async (req, res, next) => {
  const idFeedback = req.params.fid;
  const idUserLike = req.params.uid;
  let feedback;
  try {
    feedback = await Feedback.findById(idFeedback);
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to update the datas."
    );
    err.code = 500;
    return next(err);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given id"
    );
    error.code = 404;
    return next(error);
  }
  feedback.votes = feedback.votes - 1;
  function eliminarUsuario(idEliminar) {
    for (i = 0; i <= feedback.likes.length - 1; i++) {
      if (feedback.likes[i] === idEliminar) {
        feedback.likes.splice(i, 1);
        return feedback.likes;
      }
    }
    return null;
  }
  feedback.likes = eliminarUsuario(idUserLike);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await feedback.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to save the updated datas."
    );
    err.code = 500;
    return next(err);
  }
  res.json({
    feedback,
  });
};

// modify feedback
const modifyFeedback = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { title, category, details, status } = req.body;
  const idFeedback = req.params.id;
  let feedback;
  try {
    feedback = await Feedback.findById(idFeedback).populate("creator");
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to update the datas."
    );
    err.code = 500;
    return next(err);
  }
  if (!feedback) {
    const error = new Error(
      "It was not possible to recover a feedback with the given id"
    );
    error.code = 404;
    return next(error);
  }
  // if (feedback.creator.toString() !== req.userData.userId) {
  //   const err = new Error(
  //     "You do not have permission to modify this feedback."
  //   );
  //   err.code = 401;
  //   return next(err);
  // }
  feedback.title = title;
  feedback.category = category;
  feedback.details = details;
  feedback.status = status;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await feedback.save({
      session: sess,
    });
    await sess.commitTransaction();
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to save the updated datas."
    );
    err.code = 500;
    return next(err);
  }
  res.json({
    feedback,
  });
};

exports.getAllFeedbacks = getAllFeedbacks;
exports.createFeedback = createFeedback;
exports.getFeedbackById = getFeedbackById;
exports.getFeedbackByCategory = getFeedbackByCategory;
exports.getFeedbackByStatus = getFeedbackByStatus;
exports.deleteFeedback = deleteFeedback;
exports.incrementFeedback = incrementFeedback;
exports.decrementFeedback = decrementFeedback;
exports.modifyFeedback = modifyFeedback;
