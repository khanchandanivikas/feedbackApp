const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
    unique: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  avatar: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  feedbacks: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Feedback",
      default: [],
    },
  ]
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
