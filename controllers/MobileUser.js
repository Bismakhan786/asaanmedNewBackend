const MobileUser = require("../models/MobileUser");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Block multiple users
const blockMultipleUsers = catchAsyncErrors(async (req, res) => {
  const userids = req.body.userids;
  userids.map(async (uid, i) => {
    const user = await MobileUser.findById(uid);
    if (!user) {
      return next(new ErrorHandler(`User not found`, 400));
    }

    user.status = "Block";
    await user.save();
  });

  const updatedUsers = await MobileUser.find()
  const usersCount = await MobileUser.countDocuments();
  res.status(200).json({
    succes: true,
    users: updatedUsers,
    usersCount,
  });
});

//get all users for admin only
const getAllUsers = catchAsyncErrors(async (req, res) => {
  const usersCount = await MobileUser.countDocuments();

  const users = await MobileUser.find();
  res.status(200).json({
    succes: true,
    users,
    usersCount,
  });
});

//delete user --for only admins
const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await MobileUser.findById(req.params.id);

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

// get user details
const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await MobileUser.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User doesn't exist`, 400));
  }
  res.status(200).json({
    succes: true,
    user,
  });
});

// register user
const registerUser = catchAsyncErrors(async (req, res) => {
  console.log(req.body)

  const { name, contact, addressBook } = req.body;

  let user = await MobileUser.findOne({ contact });

  if (!user) {
    user = await MobileUser.create({
      name,
      contact,
      addressBook
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update user profile
const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    contact: req.body.contact,
  };

  const user = await MobileUser.findByIdAndUpdate(req.params.id, newUserData, {
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
  const USER = await MobileUser.findById(req.params.id).populate(
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
  const newItem = { productId: req.body.productId };

  const USER = await MobileUser.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  USER.favouriteItems.push(newItem);

  await USER.save();

  const updatedUser = await MobileUser.findById(req.params.id).populate(
    "favouriteItems.productId"
  );
  const updatedFavItems = updatedUser.favouriteItems;
  res.status(200).json({
    succes: true,
    favouriteItems: updatedFavItems,
  });
});

// DELETE SINGLE
const deleteFavouriteItemOfUser = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.body;

  const USER = await MobileUser.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const favouriteItems = USER.favouriteItems.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  await MobileUser.findByIdAndUpdate(
    req.params.id,
    { favouriteItems },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  const updatedUser = await MobileUser.findById(req.params.id).populate(
    "favouriteItems.productId"
  );
  const updatedFavItems = updatedUser.favouriteItems;
  res.status(200).json({
    succes: true,
    favouriteItems: updatedFavItems,
    message: "Favourite item deleted Successfully..",
  });
});

// DELETE ALL
const deleteAllFavouriteItemsOfUser = catchAsyncErrors(
  async (req, res, next) => {
    const USER = await MobileUser.findById(req.params.id);
    if (!USER) {
      return next(new ErrorHandler("User does not exist", 400));
    }

    USER.favouriteItems = [];
    await USER.save();
    res.status(200).json({
      succes: true,
      favouriteItems: [],
      message: "Favourite Items deleted successfully..",
    });
  }
);

// =========================== ADDRESS BOOK OF USER =============================

// GET
const getAllAddressesOfUser = catchAsyncErrors(async (req, res, next) => {
  const USER = await MobileUser.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }
  const addressBook = USER.addressBook;

  res.status(200).json({
    succes: true,
    addressBook,
  });
});

// ADD NEW ADDRESS
const insertAddressOfUser = catchAsyncErrors(async (req, res, next) => {
  const newAddress = {
    streetAddress: req.body.streetAddress,
    floorOrApartment: req.body.floorOrApartment,
    city: req.body.city,
    postalCode: req.body.postalCode,
  };

  const USER = await MobileUser.findById(req.params.id);
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

// UPDATE SINGLE ADDRESS
const updateAddressOfUser = catchAsyncErrors(async (req, res, next) => {
  const { addressId } = req.body;
  const newAddress = {
    streetAddress: req.body.streetAddress,
    floorOrApartment: req.body.floorOrApartment,
    city: req.body.city,
    postalCode: req.body.postalCode,
  };

  const USER = await MobileUser.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  let index = USER.addressBook.findIndex(
    (addr) => addr._id.toString() === addressId.toString()
  );
  if (index === -1) {
    return next(new ErrorHandler("Address not exist", 400));
  }

  let addressBook = USER.addressBook.slice();
  addressBook.splice(index, 1, newAddress);

  await MobileUser.findByIdAndUpdate(
    req.params.id,
    { addressBook },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  const updatedUser = await MobileUser.findById(req.params.id).populate(
    "favouriteItems.productId"
  );
  const updatedAddressBook = updatedUser.addressBook;
  res.status(200).json({
    succes: true,
    addressBook: updatedAddressBook,
    message: "Address UPDATED Successfully..",
  });
});

// DELETE SINGLE ADDRESS
const deleteAddressOfUser = catchAsyncErrors(async (req, res, next) => {
  const { addressId } = req.body;

  const USER = await MobileUser.findById(req.params.id);
  if (!USER) {
    return next(new ErrorHandler("User does not exist", 400));
  }

  const addressBook = USER.addressBook.filter(
    (addr) => addr.id.toString() !== addressId.toString()
  );
  await MobileUser.findByIdAndUpdate(
    req.params.id,
    { addressBook },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  const updatedUser = await MobileUser.findById(req.params.id).populate(
    "favouriteItems.productId"
  );
  const updatedAddressBook = updatedUser.addressBook;
  res.status(200).json({
    succes: true,
    addressBook: updatedAddressBook,
    message: "Address deleted Successfully..",
  });
});

// DELETE ALL ADDRESSES
const deleteAllAddressesOfUser = catchAsyncErrors(async (req, res, next) => {
  const USER = await MobileUser.findById(req.params.id);
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
  registerUser,
  updateUserProfile,
  getUserProfile,
  // FAVOURITES
  getFavouriteItemsOfUser,
  insertFavouriteItemOfUser,
  deleteFavouriteItemOfUser,
  deleteAllFavouriteItemsOfUser,
  // ADDRESSES
  getAllAddressesOfUser,
  deleteAddressOfUser,
  insertAddressOfUser,
  updateAddressOfUser,
  deleteAllAddressesOfUser,
  // ADMIN
  getAllUsers,
  deleteUser,
  blockMultipleUsers
};
