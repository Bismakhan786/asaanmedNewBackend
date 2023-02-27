const mongoose = require("mongoose");

const { Schema } = mongoose;

const MediaSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide the name of the image"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "Please provide the url of the image"],
  },
  public_id: {
    type: String,
    required: [true, "Please provide the public id of the image"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Media", MediaSchema);
