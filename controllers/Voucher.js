const Voucher = require('../models/Voucher')
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// ADMIN OPERATIONS---------

// create Voucher
const createVoucher = catchAsyncErrors(async (req, res) => {
  const voucher = await Voucher.create(req.body);
  res.status(200).json({
    success: true,
    voucher,
  });
});

// delete Voucher
const deleteVoucher = catchAsyncErrors(async (req, res, next) => {
  const voucher = await Voucher.findOneAndDelete({ _id: req.params.id });
  if (!voucher) {
    return next(new ErrorHandler(`Voucher ${req.params.id} not found`, 404));
  }
  res.status(200).json({
    success: true,
    message: `Successfully removed ${voucher._id} from categories`,
    voucher
  });
});

// update Voucher
const updateVoucher = catchAsyncErrors(async (req, res, next) => {
  const voucher = await Voucher.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!voucher) {
    return next(new ErrorHandler(`Voucher ${req.params.id} not found`, 404));
  }
  res.status(201).json({ success: true, voucher });
});



// BOTH ADMIN AND USER OPERATIONS --------------------

//get single Voucher
const getSingleVoucher = catchAsyncErrors(async (req, res, next) => {
  const voucher = await Voucher.findById(req.params.id).populate("items.productId");
  if (!voucher) {
    return next(new ErrorHandler(`Voucher not found`, 400));
  }

  res.status(200).json({
    success: true,
    voucher,
  });
});

// get all Vouchers
const getAllVouchers = catchAsyncErrors(async (req, res, next) => {
  const vouchers = await Voucher.find().populate("items.productId");
  res.status(200).json({
    success: true,
    vouchers,
  });
});

module.exports = {
  createVoucher,
  deleteVoucher,
  updateVoucher,
  getSingleVoucher,
  getAllVouchers,
};
