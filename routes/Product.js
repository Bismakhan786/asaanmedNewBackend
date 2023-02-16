const express = require("express");
const router = express.Router();

// categories methods
const {
  getAllCategories,
} = require("../controllers/Category");

//products methoda
const {
  getAllProducts,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteProductReview,
} = require("../controllers/Product");
const { isAuthenticated } = require("../middleware/auth");

//products routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductDetails);
router.route('/reviews/get/:id').get(getProductReviews);

router.route('/reviews/create').put(createProductReview);  // send user id in req.body
router.route('/reviews/delete/:id').delete(deleteProductReview); // send user id in req.body

// categories routes

router.route("/get/categories").get(getAllCategories);

module.exports = router;
