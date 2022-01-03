const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Feedback = require("../models/feedback");
const Comment = require("../models/comment");

// recuperar todos los comments
const getAllComments = async (req, res, next) => {
  let comments;
  try {
    comments = await Comment.find().populate("creator").populate("replies");
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!comments) {
    const error = new Error("The data could not be recovered.");
    error.code = 404;
    return next(error);
  }
  res.json({
    comments: comments,
  });
};

// crear nuevo comment
const createComment = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { details, creator, feedback_ref } = req.body;
  const nuevoComment = new Comment({
    details: details,
    creator: creator,
    feedback_ref: feedback_ref,
  });
  let feedbackRelacionado;
  try {
    feedbackRelacionado = await Feedback.findById(feedback_ref).populate(
      "comments"
    );
  } catch (error) {
    const err = new Error("Comment creation process failed.");
    err.code = 500;
    return next(err);
  }
  if (!feedbackRelacionado) {
    const error = new Error(
      "It was not possible to find a feedback with the given id."
    );
    error.code = 404;
    return next(error);
  }
  // if (feedbackRelacionado.creator.toString() !== req.userData.userId) {
  //   const err = new Error("You do not have permission to create this comment.");
  //   err.code = 401;
  //   return next(err);
  // }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoComment.save({
      session: sess,
    });
    feedbackRelacionado.comments.push(nuevoComment);
    await feedbackRelacionado.save({
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
    comment: nuevoComment,
  });
};

// recuperar comment por su idd
const getCommentById = async (req, res, next) => {
  const idComment = req.params.id;
  let comment;
  try {
    comment = await Comment.findById(idComment).populate([
      "feedback_ref",
      "replies",
    ]);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!comment) {
    const error = new Error(
      "It was not possible to recover a comment with the given id"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    comment: comment,
  });
};

// get comments for feedback by id feedback
const getCommentsByFeedbackId = async (req, res, next) => {
  const idFeedback = req.params.fid;
  let comments;
  try {
    comments = await Comment.find({feedback_ref: { $eq: idFeedback } }).populate([
      "creator",
      "feedback_ref",
      "replies",
    ]);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!comments) {
    const error = new Error(
      "It was not possible to recover comments with the given id"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    comments: comments,
  });
};

// eliminar comment por id
const deleteComment = async (req, res, next) => {
  const idcomment = req.params.id;
  let comment;
  try {
    comment = await Comment.findById(idcomment).populate("feedback_ref");
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!comment) {
    const error = new Error(
      "It was not possible to recover a comment with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (comment.creator.toString() !== req.userData.userId) {
    const error = new Error(
      "You do not have permission to delete this comment."
    );
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await comment.remove({
      session: sess,
    });
    await comment.feedback_ref.comments.pull(comment);
    await comment.feedback_ref.save({
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
    message: "Comment deleted",
  });
};

// modificar comment
const modifyComment = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { details } = req.body;
  const idComment = req.params.id;
  let comment;
  try {
    comment = await Comment.findById(idComment);
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to update the datas."
    );
    err.code = 500;
    return next(err);
  }
  if (!comment) {
    const error = new Error(
      "It was not possible to recover a comment with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (comment.creator.toString() !== req.userData.userId) {
    const err = new Error("You do not have permission to modify this comment.");
    err.code = 401;
    return next(err);
  }
  comment.details = details;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await comment.save({
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
    comment,
  });
};

exports.getAllComments = getAllComments;
exports.createComment = createComment;
exports.getCommentById = getCommentById;
exports.getCommentsByFeedbackId = getCommentsByFeedbackId;
exports.deleteComment = deleteComment;
exports.modifyComment = modifyComment;
