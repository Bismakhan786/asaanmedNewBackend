const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide category name"],
    unique: true
  },
  color: {
    type: String,
    required: true,
    minLength: [7, "Color code should be of 7 characters"],
    maxLength: [8, "Color code should be of 7 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Category', CategorySchema);
