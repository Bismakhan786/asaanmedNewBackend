const express = require("express");
const {
  createOrder,
  getAllOrdersUser,
  cancelOrder,
  getSingleOrder,
} = require("../controllers/Order");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.route("/create/:id").post(createOrder); // create order of given user id as params
router.route("/order/:id").get(getSingleOrder); 
router.route("/my/:id").get(getAllOrdersUser); // get all orders of given user id
router.route("/cancel/:id").put(cancelOrder);

module.exports = router;
