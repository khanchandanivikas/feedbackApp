const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema({
  details: {
    type: String,
    required: true,
  },
  inResponseToUser: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comment_ref: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Comment",
  },
});

module.exports = mongoose.model("Reply", replySchema);