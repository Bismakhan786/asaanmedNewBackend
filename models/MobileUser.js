const mongoose = require("mongoose");

const { Schema } = mongoose;

const MobileUserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Username must be provided"],
    maxLength: [30, "Username cannot exceed 30 characters"],
    minLength: [3, "Username should be more than 2 characters"],
  },
  contact: {
    type: String,
    required: [true, "Phone number must be provided"],
    maxLength: [11, "Phone number cannot exceed 30 characters"],
    minLength: [11, "Phone number should be of 11 characters"],
  },
  numOfOrders: {
    type: Number,
    default: 0
  },
  addressBook: [
    {
      streetAddress: { type: String, default: null },
      floorOrApartment: { type: String, default: null },
      city: { type: String, default: null },
      postalCode: { type: Number, default: null },
    },
  ],
  favouriteItems: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        default: null,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("MobileUser", MobileUserSchema);
