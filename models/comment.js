const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  details: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  feedback_ref: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Feedback",
  },
  replies: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Reply",
      default: [],
    },
  ],
});

module.exports = mongoose.model("Comment", commentSchema);
