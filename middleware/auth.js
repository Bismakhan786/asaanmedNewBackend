const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler(`Please Login to access this resource`, 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decodedData.id);
  next();
});

const isAuthorizedAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new ErrorHandler(
        `Sorry! Only admins can perform this operation`,
        403
      )
    );
  }
  next()
});

module.exports = { isAuthenticated, isAuthorizedAdmin };
