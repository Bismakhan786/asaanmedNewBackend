const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { Schema } = mongoose;

const AdminSchema = new Schema({
  name: {
    type: String,
    required: [true, "Username must be provided"],
    maxLength: [30, "Username cannot exceed 30 characters"],
    minLength: [3, "Username should be more than 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter you email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "Please prvide password"],
    minLength: [8, "Password should be 8 characters long"],
    select: false,
  },
  avatar: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

//JWT token
AdminSchema.methods.getJWTtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare passwords
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// password reset
AdminSchema.methods.getResetPasswordToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //crypt token
  const tokenCrypto = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // add to user schema
  this.resetPasswordToken = tokenCrypto;

  // set expiry time for token
  this.resetPasswordExpire = Date.now + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Admin", AdminSchema);
