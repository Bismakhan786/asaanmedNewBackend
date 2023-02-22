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

const {getUserProfile, getAllUsers, deleteUser} = require("../controllers/MobileUser")

const {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminPassword,
  updateAdminProfile,
  registerAdmin,
} = require("../controllers/Admin");
const { isAuthorizedAdmin, isAuthenticated } = require("../middleware/auth");

// Authentication
router.route("/register").post(registerAdmin);
router.route("/login").post(adminLogin);
router.route("/logout").get(adminLogout);
router.route("/me").get(isAuthenticated, isAuthorizedAdmin, getAdminProfile);
router.route('/update/password').put(isAuthenticated, isAuthorizedAdmin, updateAdminPassword);
router.route('/update/profile').put(isAuthenticated, isAuthorizedAdmin, updateAdminProfile);

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


// Orders
router.route("/orders").get(isAuthenticated, isAuthorizedAdmin, getAllOrdersAdmin);
router
  .route("/orders/:id")
  .put(isAuthenticated, isAuthorizedAdmin, updateOrderStatus)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteOrder);

// Users
router.route("/users").get(isAuthenticated, isAuthorizedAdmin, getAllUsers);
router.route("/users/orders/:id").get(isAuthenticated, isAuthorizedAdmin, getAllOrdersUser); // id = user id
router
  .route("/users/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getUserProfile)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteUser);

module.exports = router;
