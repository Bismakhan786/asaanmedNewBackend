const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProductsSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name must be provided"],
    trim: true,
  },
  code: {
    type: String,
    required : [true, "Product code must be provided"],
    trim: true
  },
  offer: {
    type: Number,
    required: [true, "Product offer must be provided"],
    default: 0.0
  },
  price: {
    type: Number,
    required: [true, "Product price must be provided"],
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
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
  ],
  status:{
    type: String,
    enum: ["Available", "Unavailable"],
    default: "Available"
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
  numOfOrders: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Product", ProductsSchema);
