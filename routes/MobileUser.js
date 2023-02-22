const express = require("express");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  getFavouriteItemsOfUser,
  insertFavouriteItemOfUser,
  deleteFavouriteItemOfUser,
  deleteAllFavouriteItemsOfUser,
  getAllAddressesOfUser,
  insertAddressOfUser,
  updateAddressOfUser,
  deleteAddressOfUser,
  deleteAllAddressesOfUser,
} = require("../controllers/MobileUser");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/me/:id").get(getUserProfile);
router.route("/profile/update/:id").put(updateUserProfile);

// FAVOURITE ITEMS OF USER
router
  .route("/favourites/:id")
  .get(getFavouriteItemsOfUser)
  .put(deleteAllFavouriteItemsOfUser); // id = user id
router.route("/favourites/item/:id").post(insertFavouriteItemOfUser).put(deleteFavouriteItemOfUser); // id = user id

// ADDRESS BOOK OF USER
router
  .route("/address/:id")
  .get(getAllAddressesOfUser)
  .delete(deleteAllAddressesOfUser); // id = user id
router
  .route("/address/single/:id")
  .put(deleteAddressOfUser)
  .post(insertAddressOfUser); // id = user  id

  router.route("/address/single/update/:id").put(updateAddressOfUser)
// SAMPLE ID 6325469dc94fdf4ba95a383f

module.exports = router;
