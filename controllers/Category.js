const Category = require("../models/Category");
const Product = require("../models/Product")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// ADMIN OPERATIONS---------

// create category
const createCategory = catchAsyncErrors(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(200).json({
    success: true,
    category,
  });
});

// delete category
const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id });
  if (!category) {
    return next(new ErrorHandler(`Category ${req.params.id} not found`, 404));
  }
  
  const products = await Product.deleteMany({cat: req.params.id});
  if(!products){
    return next(new ErrorHandler(`No products from this category`, 404));
  }

  res.status(200).json({
    success: true,
    message: `Successfully removed ${category.name} from categories`,
    category
  });
});

// update category
const updateCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    return next(new ErrorHandler(`Category ${req.params.id} not found`, 404));
  }
  res.status(201).json({ success: true, category });
});



// BOTH ADMIN AND USER OPERATIONS --------------------

//get single category
const getSingleCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler(`Category not found`, 400));
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// get all categories
const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    categories,
  });
});

module.exports = {
  createCategory,
  deleteCategory,
  updateCategory,
  getSingleCategory,
  getAllCategories,
};
