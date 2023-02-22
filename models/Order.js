const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrdersSchema = new Schema({
  shippingInfo: {
    streetAddress: {
      type: String,
      required: true,
    },
    floorOrApartment: {
      type: String,
      default: null
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
  },
  orderItems: [
    {
      qty: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'MobileUser',
    required: true,
  },
  
  paymentInfo: {
    paymentType: {
      type: String,
      default: "Cash on delivery"
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
    default: null
  },
  itemsTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  modifiedAt: Date,
});

module.exports = mongoose.model("Order", OrdersSchema);
