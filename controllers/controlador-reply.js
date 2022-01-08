const express = require("express");
const app = express();
app.use(express.json());
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Feedback = require("../models/feedback");
const Comment = require("../models/comment");
const Reply = require("../models/reply");

// recuperar todos los replies
const getAllReplies = async (req, res, next) => {
  let replies;
  try {
    replies = await Reply.find().populate(["creator", "comment_ref"]);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!replies) {
    const error = new Error("The data could not be recovered.");
    error.code = 404;
    return next(error);
  }
  res.json({
    replies: replies,
  });
};

// crear nuevo reply
const createReply = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const {
    details,
    creator,
    comment_ref,
    creatorName,
    creatorUserName,
    creatorAvatar,
    inResponseToUser,
  } = req.body;
  const nuevoReply = new Reply({
    details: details,
    inResponseToUser: inResponseToUser,
    creator: creator,
    creatorName: creatorName,
    creatorUserName: creatorUserName,
    creatorAvatar: creatorAvatar,
    comment_ref: comment_ref,
  });
  let commentRelacionado;
  try {
    commentRelacionado = await Comment.findById(comment_ref).populate(
      "replies"
    );
  } catch (error) {
    const err = new Error("Reply creation process failed.");
    err.code = 500;
    return next(err);
  }
  if (!commentRelacionado) {
    const error = new Error(
      "It was not possible to find a comment with the given id."
    );
    error.code = 404;
    return next(error);
  }
  // if (commentRelacionado.creator.toString() !== req.userData.userId) {
  //   const err = new Error("You do not have permission to create this reply.");
  //   err.code = 401;
  //   return next(err);
  // }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await nuevoReply.save({
      session: sess,
    });
    commentRelacionado.replies.push(nuevoReply);
    await commentRelacionado.save({
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
    reply: nuevoReply,
  });
};

// recuperar reply por su id
const getReplyById = async (req, res, next) => {
  const idReply = req.params.id;
  let reply;
  try {
    reply = await Reply.findById(idReply).populate(["creator", "comment_ref"]);
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!reply) {
    const error = new Error(
      "It was not possible to recover a reply with the given id"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    reply: reply,
  });
};

// eliminar reply por id
const deleteReply = async (req, res, next) => {
  const idReply = req.params.id;
  let reply;
  try {
    reply = await Reply.findById(idReply).populate("comment_ref");
  } catch (err) {
    const error = new Error(
      "There was some error. It was not possible to recover the datas."
    );
    error.code = 500;
    return next(error);
  }
  if (!reply) {
    const error = new Error(
      "It was not possible to recover a reply with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (reply.creator.toString() !== req.userData.userId) {
    const error = new Error("You do not have permission to delete this reply.");
    error.code = 401;
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await reply.remove({
      session: sess,
    });
    await reply.comment_ref.replies.pull(reply);
    await reply.comment_ref.save({
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
    message: "Reply deleted",
  });
};

// modificar reply
const modifyReply = async (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error("Validation Error. Check the datas.");
    error.code = 422;
    return next(error);
  }
  const { details } = req.body;
  const idReply = req.params.id;
  let reply;
  try {
    reply = await Reply.findById(idReply);
  } catch (error) {
    const err = new Error(
      "There was some error. It was not possible to update the datas."
    );
    err.code = 500;
    return next(err);
  }
  if (!reply) {
    const error = new Error(
      "It was not possible to recover a reply with the given id"
    );
    error.code = 404;
    return next(error);
  }
  if (reply.creator.toString() !== req.userData.userId) {
    const err = new Error("You do not have permission to modify this reply.");
    err.code = 401;
    return next(err);
  }
  reply.details = details;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await reply.save({
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
    reply,
  });
};

exports.getAllReplies = getAllReplies;
exports.createReply = createReply;
exports.getReplyById = getReplyById;
exports.deleteReply = deleteReply;
exports.modifyReply = modifyReply;
