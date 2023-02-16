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
  const { name, price, desc, cat, status } = req.body;

  const product = await (
    await Product.create({
      name,
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

// create or update product reviews
const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productID, userId, userName } = req.body;

  const review = {
    user: userId,
    name: userName,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productID);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === userId.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === userId.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    succes: true,
  });
});

//====================================== UPDATE FUNCTIONS ======================================

const updateOneProduct = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "Products",
    width: 150,
    crop: "scale",
    resource_type: "auto",
  });

  const { name, price, desc, cat, status, disc } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
      name,
      price,
      desc,
      cat,
      status,
      disc,
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

// if user wants to delete his/her review
const deleteProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(`Product not found`, 400));
  }

  const { userId } = req.body;
  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== userId.toString()
  );

  const numOfReviews = reviews.length;

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  // because if length is 0 then divide by zero is NaN value
  if (reviews.length !== 0) {
    ratings = avg / reviews.length;
  }

  await Product.findByIdAndUpdate(
    req.params.id,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    succes: true,
    message: "Review deleted Successfully..",
  });
});

//====================================== GET FUNCTIONS ======================================

// both admin and client operations
const getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPgae = 5;

  const productCount = await Product.countDocuments();

  // const apiFeatures = new ApiFeatures(Product.find().populate("cat", "name color"), req.query)
  //   .search()
  //   .filter()
  //   .pagination(resultPerPgae);
  // const products = await apiFeatures.query;

  const products = await Product.find({})
    .populate("cat", "name color")
    .populate("reviews.user", "name avatar");

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

const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler(`Product not found`, 400));
  }

  res.status(200).json({
    succes: true,
    reviews: product.reviews,
  });
});

module.exports = {
  createProduct,
  createProductReview,
  updateOneProduct,
  deleteOneProduct,
  deleteAllProducts,
  deleteProductReview,
  getAllProducts,
  getProductDetails,
  getProductReviews,
};
