const Admin = require("../models/Admin");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// register admin
const registerAdmin = catchAsyncErrors(async (req, res) => {
  

  const { name, email, password } = req.body;

  const admin = await Admin.create({name, email, password})




  res.status(200).json({
    success: true,
    admin
  })
});



// get admin details
const getAdminProfile = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id);

  res.status(201).json({
    success: true,
    admin,
  });
});



// admin login
const adminLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //check if user has give password and email both
  if (!email || !password) {
    return next(new ErrorHandler(`Please provide credentials`, 400));
  }
  const admin = await Admin.findOne({ email, isAdmin: true }).select("+password");
  if (!admin) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  const isPasswordMatched = await admin.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler(`Invalid email or password`, 401));
  }

  sendToken(admin, 200, res);
});

//logout user
const adminLogout = catchAsyncErrors(async (req, res, next) => {
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
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) {
    return next(new ErrorHandler(`User not found`, 404));
  }

  //get reset password token
  const resetToken = admin.getResetPasswordToken();
  await admin.save({ validateBeforeSave: false });

  // link for reset password
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  // message to send to user
  const message = `Your password reset token :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: admin.email,
      subject: `ASAANMED Password Recovery`,
      message: message,
    });

    res.status(200).json({
      succes: true,
      message: `Email send to ${admin.email} successfully`,
    });
  } catch (error) {
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save({ validateBeforeSave: false });

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

  const admin = Admin.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!admin) {
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

  admin.password = req.body.password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpire = undefined;

  await admin.save();

  sendToken(admin, 200, res);
});


// update admin password
const updateAdminPassword = catchAsyncErrors(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id).select("+password");

  const isPasswordMatched = await admin.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(`Old password is incorrect ${req.body.oldPassword}`, 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords doesn't match`, 400));
  }

  admin.password = req.body.newPassword;

  await admin.save();

  sendToken(admin, 200, res);
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

  const newAdminData = {
    name: req.body.name,
    email: req.body.email,
    avatar,
  };

  // we will add cloudinary later

  const admin = await Admin.findByIdAndUpdate(req.user.id, newAdminData, {
    new: true,
    runValidators: true,
    userFindAndModify: true,
  });

  res.status(200).json({
    succes: true,
    admin,
  });
});



module.exports = {
  registerAdmin,
  adminLogin,
  adminLogout,
  forgotPassword,
  resetPassword,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
};
