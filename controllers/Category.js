const Category = require("../models/Category");
const Product = require("../models/Product");
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
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler(`Category ${req.params.id} not found`, 404));
  }

  const deleteProductsRes = await Product.deleteMany({ cat: req.params.id });
  if (!deleteProductsRes.acknowledged) {
    return next(new ErrorHandler(`No products from this category`, 404));
  }

  await category.remove();
  const updatedCategories = await Category.find();
  res.status(200).json({
    success: true,
    deletedProducts: deleteProductsRes.deletedCount,
    categories: updatedCategories,
    message: `Successfully removed ${category.name} from categories`,
  });
});

// delete many categories
const deleteManyCategories = catchAsyncErrors(async (req, res, next) => {
  let categoryids = [];

  categoryids = req.body.categoryids;

  for (let i = 0; i < categoryids.length; i++) {
    const category = await Category.findById(categoryids[i]);
    if (!category) {
      return next(
        new ErrorHandler(`Category ${categoryids[i]} not found`, 404)
      );
    }

    const deleteProductsRes = await Product.deleteMany({ cat: categoryids[i] });
    if (!deleteProductsRes.acknowledged) {
      return next(new ErrorHandler(`No products from this category`, 404));
    }
    await category.remove();
  }

  const updatedCategories = await Category.find();
  res.status(200).json({
    success: true,
    deletedCount: categoryids.length,
    categories: updatedCategories,
    message: `Categories removed Successfully`,
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
  deleteManyCategories
};
