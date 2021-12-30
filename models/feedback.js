const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["UI", "UX", "enhancement", "bug", "feature"],
    required: true,
  },
  status: {
    type: String,
    enum: ["planned", "in-progress", "live"],
    default: "planned",
  },
  details: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: [
    {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Comment",
        default: [],
    },
  ],
});

module.exports = mongoose.model("Feedback", feedbackSchema);
