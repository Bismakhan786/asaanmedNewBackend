const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  getFavouriteItemsOfUser,
  deleteAllFavouriteItemsOfUser,
  getAllAddressesOfUser,
  deleteAllAddressesOfUser,
  deleteFavouriteItemOfUser,
  insertFavouriteItemOfUser,
  deleteAddressOfUser,
  insertAddressOfUser,
} = require("../controllers/User");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword); // remaining
router.route("/password/reset/:token").put(resetPassword); //remaining
router.route("/me/:id").get(getUserProfile);
router.route("/password/update/:id").put(updateUserPassword);
router.route("/profile/update/:id").put(updateUserProfile);

// FAVOURITE ITEMS OF USER
router
  .route("/favourites/:id")
  .get(getFavouriteItemsOfUser)
  .delete(deleteAllFavouriteItemsOfUser); // id = user id
router.route("/favourites/add/:id").post(insertFavouriteItemOfUser); // id = user id
router.route("/favourites/remove/:id").post(deleteFavouriteItemOfUser); // id = user.id

// ADDRESS BOOK OF USER
router
  .route("/address/:id")
  .get(getAllAddressesOfUser)
  .delete(deleteAllAddressesOfUser); // id = user id
router
  .route("/address/single/:id")
  .delete(deleteAddressOfUser)
  .post(insertAddressOfUser); // id = user  id

// SAMPLE ID 6325469dc94fdf4ba95a383f

module.exports = router;
