const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

//====================================== CREATE FUNCTION ======================================

// admin operations
const createProduct = catchAsyncErrors(async (req, res) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "Products",
    width: 150,
    crop: "scale",
    resource_type: "auto",
  });

  // get admin id
  const createdBy = req.user.id;
  const { name, code, offer, price, desc, cat, status } = req.body;

  const product = await (
    await Product.create({
      name,
      code,
      offer,
      price,
      desc,
      cat,
      status,
      image: [
        {
          public_id: myCloud.public_id,
          url: myCloud.url,
        },
      ],
      createdBy,
    })
  ).populate("cat");
  res.status(201).json({ success: true, product });
});


//====================================== UPDATE FUNCTIONS ======================================

const updateOneProduct = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "Products",
    width: 150,
    crop: "scale",
    resource_type: "auto",
  });

  const { name, code, offer, price, desc, cat, status } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
      name,
      code,
      offer,
      price,
      desc,
      cat,
      status,
      image: [
        {
          public_id: myCloud.public_id,
          url: myCloud.url,
        },
      ],
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("cat");

  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }

  // const products = await Product.find({});
  res.status(201).json({ success: true, product });
});

//====================================== DELETE FUNCTIONS ======================================

const deleteOneProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id });
  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }

  res.status(200).json({ success: true, product });
});

const deleteAllProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  products.forEach(async (product) => await product.remove());

  res.status(200).json({
    succes: true,
    message: `Successfully deleted all the products`,
  });
});


//====================================== GET FUNCTIONS ======================================

// both admin and client operations
const getAllProducts = catchAsyncErrors(async (req, res) => {
 
  const productCount = await Product.countDocuments();

  const products = await Product.find({})
    .populate("cat", "name color");

  if (!products) {
    return next(new ErrorHandler(`Products not found`, 404));
  }

  res.status(200).json({ succes: true, products, productCount });
});

const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "cat",
    "name"
  );

  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }

  res.status(201).json({ success: true, product });
});


module.exports = {
  createProduct,
  updateOneProduct,
  deleteOneProduct,
  deleteAllProducts,
  getAllProducts,
  getProductDetails,
};
