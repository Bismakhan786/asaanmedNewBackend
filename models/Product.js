const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProductsSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name must be provided"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Product price must be provided"],
  },
  disc: {
    type: Number,
    default: 0.0
  },
  desc: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  cat: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, "Category is required"],
  },
  image: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        default: 0,
      },
      comment: {
        type: String,
        required: true
      },
    },
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  status:{
    type: String,
    default: 'Available'
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    default: 1,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductsSchema);
