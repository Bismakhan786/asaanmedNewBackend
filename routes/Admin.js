const express = require("express");
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  deleteCategory,
  updateCategory,
  deleteManyCategories,
} = require("../controllers/Category");
const {
  getAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder,
  getSingleOrder,
  getAllOrdersUser,
  updateManyOrderStatus,
  deleteManyOrders,
} = require("../controllers/Order");
const {
  getAllProducts,
  createProduct,
  deleteAllProducts,
  updateOneProduct,
  deleteOneProduct,
  deleteManyProducts,
  updateStatusOfManyProducts,
  updateStockOfManyProducts,
  updateCategoryOfManyProducts,
  createManyProducts,
} = require("../controllers/Product");
const router = express.Router();

const {
  getUserProfile,
  getAllUsers,
  deleteUser,
  blockMultipleUsers,
} = require("../controllers/MobileUser");

const {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminPassword,
  updateAdminProfile,
  registerAdmin,
} = require("../controllers/Admin");
const { isAuthorizedAdmin, isAuthenticated } = require("../middleware/auth");
const {
  createMedia,
  deleteMedia,
  getAllMedia,
  deleteAllMedia,
} = require("../controllers/Media");

// Authentication
router.route("/register").post(registerAdmin);
router.route("/login").post(adminLogin);
router.route("/logout").get(adminLogout);
router.route("/me").get(isAuthenticated, isAuthorizedAdmin, getAdminProfile);
router
  .route("/update/password")
  .put(isAuthenticated, isAuthorizedAdmin, updateAdminPassword);
router
  .route("/update/profile")
  .put(isAuthenticated, isAuthorizedAdmin, updateAdminProfile);

// Products
router.route("/products").get(getAllProducts);
router
  .route("/product/create")
  .post(isAuthenticated, isAuthorizedAdmin, createProduct);

router
  .route("/product/create/many")
  .post(isAuthenticated, isAuthorizedAdmin, createManyProducts);
router
  .route("/product/deleteAll")
  .delete(isAuthenticated, isAuthorizedAdmin, deleteAllProducts);
router
  .route("/products/delete/many")
  .put(isAuthenticated, isAuthorizedAdmin, deleteManyProducts);
router
  .route("/product/modify/:id")
  .put(isAuthenticated, isAuthorizedAdmin, updateOneProduct)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteOneProduct);

router
  .route("/products/update/status")
  .put(isAuthenticated, isAuthorizedAdmin, updateStatusOfManyProducts);
router
  .route("/products/update/stock")
  .put(isAuthenticated, isAuthorizedAdmin, updateStockOfManyProducts);
router
  .route("/products/update/category")
  .put(isAuthenticated, isAuthorizedAdmin, updateCategoryOfManyProducts);

// Categories

router.route("/categories").get(getAllCategories);
router
  .route("/categories/delete/many")
  .put(isAuthenticated, isAuthorizedAdmin, deleteManyCategories);

router
  .route("/categories/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getSingleCategory)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteCategory)
  .put(isAuthenticated, isAuthorizedAdmin, updateCategory);
router
  .route("/categories/new/create")
  .post(isAuthenticated, isAuthorizedAdmin, createCategory);

// Orders
router
  .route("/orders")
  .get(isAuthenticated, isAuthorizedAdmin, getAllOrdersAdmin);
router
  .route("/orders/update/status/many")
  .put(isAuthenticated, isAuthorizedAdmin, updateManyOrderStatus);
router
  .route("/orders/delete/many")
  .put(isAuthenticated, isAuthorizedAdmin, deleteManyOrders);
router
  .route("/orders/:id")
  .put(isAuthenticated, isAuthorizedAdmin, updateOrderStatus)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteOrder);

// Users
router.route("/users").get(isAuthenticated, isAuthorizedAdmin, getAllUsers);
router
  .route("/users/block")
  .get(isAuthenticated, isAuthorizedAdmin, blockMultipleUsers);
router
  .route("/users/orders/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getAllOrdersUser); // id = user id
router
  .route("/users/:id")
  .get(isAuthenticated, isAuthorizedAdmin, getUserProfile)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteUser);

// Media
router
  .route("/media/upload")
  .post(isAuthenticated, isAuthorizedAdmin, createMedia);
router
  .route("/media/delete/:id")
  .delete(isAuthenticated, isAuthorizedAdmin, deleteMedia);
router
  .route("/media/delete/all/images")
  .delete(isAuthenticated, isAuthorizedAdmin, deleteAllMedia);
router.route("/media").get(isAuthenticated, isAuthorizedAdmin, getAllMedia);
module.exports = router;
