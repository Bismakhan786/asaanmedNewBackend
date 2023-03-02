const Order = require("../models/Order");
const Product = require("../models/Product");
const MobileUser = require("../models/MobileUser");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create order
const createOrder = catchAsyncErrors(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsTotal,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    user: req.params.id,
    paymentInfo,
    itemsTotal,
    shippingPrice,
    totalPrice,
  });

  const myOrders = await Order.find({})
  res.status(200).json({
    success: true,
    myOrders,
  });
});

// get all orders from all users --admin
const getAllOrdersAdmin = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user")
    .populate("orderItems.product");

  // calculate total amount of all orders
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  // calculate number of orders
  const ordersCount = orders.length;

  res.status(200).json({
    success: true,
    orders,
    ordersCount,
    totalAmount,
  });
});

// update many order status --admin
const updateManyOrderStatus = catchAsyncErrors(async (req, res, next) => {
  
  let orderids = []
  let orderStatus = ""

  orderids = req.body.orderids
  orderStatus = req.body.orderStatus


  for (let i = 0; i < orderids.length; i++) {
    const order = await Order.findById(orderids[i]);
    if (!order) {
      return next(new ErrorHandler(`Order not found`, 404));
    }

    if (orderStatus === "Shipped") {
      order.shippedAt = Date.now();
      order.modifiedAt = Date.now();
      order.orderItems.forEach(async (item) => {

        const product = await Product.findById(item.product)

        if (!product) {
          return next(new ErrorHandler(`Product not found`, 404));
        }
        if (product.stock < qty) {
          return next(new ErrorHandler(`Failed, Insufficient stock!`, 400));
        }

        await updateStockAndNumOfOrders(item.product, item.qty);
      });
      order.orderStatus = "Shipped";
      await order.save({ validateBeforeSave: false });

      const user = await MobileUser.findById(order.user);
      if (!user) {
        return next(new ErrorHandler(`User not found`, 404))
      }
      user.numOfOrders += 1;
      await user.save({ validateBeforeSave: false });
    }

    if(order.orderStatus === "Delivered"){
      order.deliveredAt = Date.now();
        order.modifiedAt = Date.now();
        order.paymentInfo.status = "Paid";
        order.paidAt = Date.now();
        order.orderStatus = "Delivered";
      await order.save({ validateBeforeSave: false });
    }

    if(order.orderStatus === "Cancelled"){
      order.cancelledAt = Date.now()
      order.modifiedAt = Date.now()
      order.orderStatus = "Cancelled"
      await order.save({ validateBeforeSave: false });
    }

  }

  const orders = await Order.find()
    .populate("user")
    .populate("orderItems.product");

  // calculate total amount of all orders
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  // calculate number of orders
  const ordersCount = orders.length;

  res.status(200).json({
    success: true,
    orders,
    totalAmount,
    ordersCount,
    updatedCount: orderids.length
  });
});

// update order status --admin
const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler(`Order not found`, 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler(`You have already delivered this order`, 400));
  }

  if (order.orderStatus === "Cancelled") {
    return next(new ErrorHandler(`This is a cancelled order`, 400));
  }

  order.orderItems.forEach(async (item) => {
    await updateStockAndNumOfOrders(item.product, item.qty);
  });

  const user = await MobileUser.findById(order.user);
  if (!user) {
    return next(new ErrorHandler(`User not found`, 404));
  }
  user.numOfOrders += 1;
  await user.save({ validateBeforeSave: false });

  order.orderStatus = orderStatus;

  if (orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
    order.modifiedAt = Date.now();
    order.paymentInfo.status = "Paid";
    order.paidAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});


// delete many order --admin
const deleteManyOrders = catchAsyncErrors(async (req, res, next) => {
  
  let orderids = []
  orderids = req.body.orderids

  for(let i = 0; i< orderids.length; i++){
    const order = await Order.findByIdAndDelete(orderids[i]);
  if (!order) {
    return next(new ErrorHandler(`Order not found`, 404));
  }
  }

  const orders = await Order.find()
    .populate("user")
    .populate("orderItems.product");

  // calculate total amount of all orders
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  // calculate number of orders
  const ordersCount = orders.length;
  res.status(200).json({
    success: true,
    message: `Orders has been deleted successfully`,
    orders,
    totalAmount,
    ordersCount,
    deletedCount: orderids.length
  });
});

// delete order --admin
const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(new ErrorHandler(`Order not found`, 404));
  }

  const orders = await Order.find()
    .populate("user")
    .populate("orderItems.product");

  // calculate total amount of all orders
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  // calculate number of orders
  const ordersCount = orders.length;
  res.status(200).json({
    success: true,
    message: `Order #${req.params.id} has been deleted successfully`,
    orders,
    totalAmount,
    ordersCount,
  });
});

// get all my orders --user
const getAllOrdersUser = catchAsyncErrors(async (req, res, next) => {
  const myOrders = await Order.find({ user: req.params.id })
    .populate("user")
    .populate("orderItems.product");

  if (!myOrders) {
    return next(new ErrorHandler(`Sorry! we could not find any orders`, 400));
  }

  res.status(200).json({
    success: true,
    myOrders,
  });
});

// cancel order --user
const cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler(`Order ${req.params.id} not found`, 400));
  }

  if (order.orderStatus === "Processing") {
    order.orderStatus = "Cancelled";
    order.cancelledAt = Date.now()
    order.modifiedAt = Date.now();
  } else {
    return next(
      new ErrorHandler(
        `Once the order has been shipped then it cannot be cancelled`,
        400
      )
    );
  }

  await order.save();

  const myOrders = await Order.find()

  res.status(200).json({
    success: true,
    myOrders,
    message: `Your order has been cancelled successfully`,
  });
});

// get single order --both admin and user
const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("orderItems.product")
    .populate("user");
  if (!order) {
    return next(new ErrorHandler(`Order not found`, 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

// update order

module.exports = {
  createOrder,

  getAllOrdersAdmin,
  updateManyOrderStatus,
  updateOrderStatus,
  deleteOrder,
  deleteManyOrders,

  getAllOrdersUser,
  cancelOrder,
  getSingleOrder,
};

//================ HELPING FUNCTIONS =================================

async function updateStockAndNumOfOrders(productID, qty) {
  const product = await Product.findById(productID);
  
  product.stock -= qty;
  product.numOfOrders += 1;

  await product.save({ validateBeforeSave: false });
}
