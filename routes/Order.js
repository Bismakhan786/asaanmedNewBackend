const express = require("express");
const {
  createOrder,
  getAllOrdersUser,
  cancelOrder,
  getSingleOrder,
} = require("../controllers/Order");
const router = express.Router();

router.route("/create/:id").post(createOrder); // id = user id
router.route("/order/:id").get(getSingleOrder);  // id = order id
router.route("/my/:id").get(getAllOrdersUser); // id = user id
router.route("/cancel/:id").put(cancelOrder); // id = order id

module.exports = router;
