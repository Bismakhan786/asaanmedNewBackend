const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//get all users for admin only
const getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    succes: true,
    users,
  });
});

// get user details
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User doesn't exist`, 400));
  }
  res.status(200).json({
    succes: true,
    user,
  });
});

// get admin details
const getAdminProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(201).json({
    success: true,
    user,
  });
});

// make user admin or reverve rights of admin from user --for only admins
const changeUserRole = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found`, 400));
  }

  user.isAdmin = req.body.isAdmin;
  await user.save();

  res.status(200).json({
    succes: true,
    message: `Changed User rights of ${user.name} as Admin: ${user.isAdmin}`,
    user,
  });
});

//delete user --for only admins
const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User not found`, 400));
  }

  await user.remove();

  res.status(200).json({
    succes: true,
    message: "User Deleted Successfully",
    user,
  });
});

// register user
const registerUser = catchAsyncErrors(async (req, res) => {
  let avatar = {
    public_id: "Sample",
    url: "Sample",
  };

  if (req.body.image) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Profiles",
      width: 150,
      crop: "scale",
      resource_type: "auto",
    });

    avatar.public_id = myCloud.public_id;
    avatar.url = myCloud.url;
  }

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  sendToken(user, 201, res);
});

// login user
const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user has give password and email both
  if (!email || !password) {
    return next(new ErrorHandler(`Please provide credentials`, 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  sendToken(user, 200, res);
});

// admin login
const adminLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user has give password and email both
  if (!email || !password) {
    return next(new ErrorHandler(`Please provide credentials`, 400));
  }
  const user = await User.findOne({ email, isAdmin: true }).select("+password");
  if (!user) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  sendToken(user, 200, res);
});

//logout user
const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// fogot password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //find user who want to reset password
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler(`User not found`, 404));
  }

  //get reset password token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // link for reset password
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  // message to send to user
  const message = `Your password reset token :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `ASAANMED Password Recovery`,
      message: message,
    });

    res.status(200).json({
      succes: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password
const resetPassword = catchAsyncErrors(async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        `Reset password token is invalid or has been expired`,
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler(`Password does not match with confirm password`, 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

const getOrdersAndReviewsOfUser = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.params.id }).select(
    "totalPrice createdAt"
  );
  if (!orders) {
    return next(new ErrorHandler("No orders found", 404));
  }
  const products = await Product.find({
    reviews: { $elemMatch: { user: req.params.id } },
  }).select("name reviews");
  if (!products) {
    return next(new ErrorHandler("No orders found", 404));
  }

  res.status(201).json({
    success: true,
    orders,
    products,
  });
});

// update user password
const updateAdminPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(`Old password is incorrect ${req.body.oldPassword}`, 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords doesn't match`, 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update user profile
const updateAdminProfile = catchAsyncErrors(async (req, res, next) => {
  let avatar = {
    public_id: null,
    url: null,
  };

  if (req.body.image) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Profiles",
      width: 150,
      crop: "scale",
      resource_type: "auto",
    });

    avatar.public_id = myCloud.public_id;
    avatar.url = myCloud.url;
  }

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    avatar,
  };

  // we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    userFindAndModify: true,
  });

  res.status(200).json({
    succes: true,
    user,
  });
});

const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(`Old password is incorrect ${req.body.oldPassword}`, 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords doesn't match`, 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update user profile
const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  let avatar = {
    public_id: null,
    url: null,
  };

  if (req.body.image) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Profiles",
      width: 150,
      crop: "scale",
      resource_type: "auto",
    });

    avatar.public_id = myCloud.public_id;
    avatar.url = myCloud.url;
  }

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    avatar,
  };

  // we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    userFindAndModify: true,
  });

  if (!user) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  res.status(200).json({
    succes: true,
    user,
  });
});

// =========================== FAVORITE ITEMS OF USER =============================
// GET
const getFavouriteItemsOfUser = catchAsyncErrors(async (req, res, next) => {
  const USER = await User.findById(req.params.id).populate(
    "favouriteItems.productId"
  );
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }
  const favouriteItems = USER.favouriteItems;

  res.status(200).json({
    succes: true,
    favouriteItems,
  });
});

// UPDATE
const insertFavouriteItemOfUser = catchAsyncErrors(async (req, res, next) => {
  const  newItem  = {productId: req.body.productId};

  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  USER.favouriteItems.push(newItem);

  USER.save();
  res.status(200).json({
    succes: true,
    favouriteItems: USER.favouriteItems,
  });
});

// DELETE SINGLE
const deleteFavouriteItemOfUser = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.body;

  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const favouriteItems = USER.favouriteItems.filter(
    (item) => item.productId.id.toString() !== productId.toString()
  );
  await User.findByIdAndUpdate(
    req.params.id,
    { favouriteItems },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    succes: true,
    favouriteItems: USER.favouriteItems,
    message: "Favourite item deleted Successfully..",
  });
});

// DELETE ALL
const deleteAllFavouriteItemsOfUser = catchAsyncErrors(
  async (req, res, next) => {
    const USER = await User.findById(req.params.id);
    if (!USER) {
      return next(new ErrorHandler("User does not exist", 400));
    }

    USER.favouriteItems = [];
    USER.save();
    res.status(200).json({
      succes: true,
      message: "Favourite Items deleted successfully..",
    });
  }
);

// =========================== ADDRESS BOOK OF USER =============================

// GET
const getAllAddressesOfUser = catchAsyncErrors(async (req, res, next) => {
  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }
  const addressBook = USER.addressBook;

  res.status(200).json({
    succes: true,
    addressBook,
  });
});

// UPDATE
const insertAddressOfUser = catchAsyncErrors(async (req, res, next) => {
  const newAddress = {
    streetAddress: req.body.streetAddress,
    floorOrApartment: req.body.floorOrApartment,
    city: req.body.city,
    postalCode: req.body.postalCode,
  };

  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  USER.addressBook.push(newAddress);

  USER.save();
  res.status(200).json({
    succes: true,
    addressBook: USER.addressBook,
  });
});

// DELETE SINGLE ADDRESS
const deleteAddressOfUser = catchAsyncErrors(async (req, res, next) => {
  const { addressId } = req.body;

  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const addressBook = USER.addressBook.filter(
    (addr) => addr.id.toString() !== addressId.toString()
  );
  await User.findByIdAndUpdate(
    req.params.id,
    { addressBook },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    succes: true,
    message: "Address deleted Successfully..",
  });
});

// DELETE ALL ADDRESSES
const deleteAllAddressesOfUser = catchAsyncErrors(async (req, res, next) => {
  const USER = await User.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  USER.addressBook = [];
  USER.save();
  res.status(200).json({
    succes: true,
    message: "Addresses deleted successfully..",
  });
});

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  adminLogin,
  logoutUser,
  forgotPassword,
  resetPassword,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
  updateUserPassword,
  updateUserProfile,
  getUserProfile,
  deleteUser,
  changeUserRole,
  getOrdersAndReviewsOfUser,
  // FAVOURITES
  getFavouriteItemsOfUser,
  insertFavouriteItemOfUser,
  deleteFavouriteItemOfUser,
  deleteAllFavouriteItemsOfUser,
  // ADDRESSES
  getAllAddressesOfUser,
  deleteAddressOfUser,
  insertAddressOfUser,
  deleteAllAddressesOfUser,
};
