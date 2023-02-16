const express = require("express");
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/Category");
const {
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder,
  getSingleOrder,
  getAllOrdersUser,
} = require("../controllers/Order");
const {
  getAllProducts,
  createProduct,
  deleteAllProducts,
  updateOneProduct,
  deleteOneProduct,
} = require("../controllers/Product");
const router = express.Router();

const {
  adminLogin,
  getAllUsers,
  changeUserRole,
  deleteUser,
  logoutUser,
  getOrdersAndReviewsOfUser,
  getAdminProfile,
  updateAdminPassword,
  updateUserPassword,
  getUserProfile,
} = require("../controllers/User");
const {
  getAllVouchers,
  getSingleVoucher,
  deleteVoucher,
  updateVoucher,
  createVoucher,
} = require("../controllers/Voucher");
const { isAuthorizedAdmin, isAuthenticated } = require("../middleware/auth");

// Authentication
router.route("/login").post(adminLogin);
router.route("/logout").get(logoutUser);
router.route("/me").get(isAuthenticated, isAuthorizedAdmin, getAdminProfile);
router.route('/update/password').put(isAuthenticated, isAuthorizedAdmin, updateAdminPassword);
router.route('/update/profile').put(isAuthenticated, isAuthorizedAdmin, updateUserPassword);

// Products
router.route("/products").get(getAllProducts);
router
  .route("/product/create")
  .post(isAuthenticated, isAuthorizedAdmin, createProduct);
router
  .route("/product/deleteAll")
  .delete(isAuthenticated, isAuthorizedAdmin, deleteAllProducts);
router
  .route("/product/modify/:id")
  .put(isAuthenticated, isAuthorizedAdmin, updateOneProduct)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteOneProduct);

// Categories

router.route("/categories").get(getAllCategories);
router
  .route("/categories/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getSingleCategory)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteCategory)
  .put(isAuthenticated, isAuthorizedAdmin, updateCategory);
router
  .route("/categories/new/create")
  .post(isAuthenticated, isAuthorizedAdmin, createCategory);

// Vouchers

router.route("/vouchers").get(getAllVouchers);
router
  .route("/vouchers/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getSingleVoucher)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteVoucher)
  .put(isAuthenticated, isAuthorizedAdmin, updateVoucher);
router
  .route("/vouchers/new/create")
  .post(isAuthenticated, isAuthorizedAdmin, createVoucher);

// Orders
router.route("/orders").get(getAllOrdersAdmin);
router
  .route("/orders/:id")
  .put(isAuthenticated, isAuthorizedAdmin, updateOrderStatus)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteOrder);

// Users
router.route("/users").get(getAllUsers);
router.route("/users/ordersAndReviews/:id").get(isAuthenticated, isAuthorizedAdmin, getOrdersAndReviewsOfUser);
router
  .route("/users/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getUserProfile)
  .put(isAuthenticated, isAuthorizedAdmin, changeUserRole)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteUser);

module.exports = router;
