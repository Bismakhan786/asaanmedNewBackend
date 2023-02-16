const mongoose = require("mongoose");

const { Schema } = mongoose;

const VoucherSchema = new Schema({
  percentage: {
    type: Number,
    required: [true, "Please provide discount percentage"],
  },
  code: {
    type: String,
    required: [true, "Please provide voucher code"]
  },
  publish: {
    type: String,
    default: "Publish Later"
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  expiredAt: {
    type: Date,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Voucher", VoucherSchema);
