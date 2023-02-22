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
} = require("../controllers/Product");

//products routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductDetails);

// categories routes

router.route("/get/categories").get(getAllCategories);

module.exports = router;
