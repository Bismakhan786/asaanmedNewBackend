const Product = require("../models/Product");
const Category = require("../models/Category");
const Media = require("../models/Media");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");
const Order = require("../models/Order");

const gen_random_hex_color_code = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return "#" + n.slice(0, 6);
};

//====================================== CREATE FUNCTION ======================================

// admin operations

const createManyProducts = catchAsyncErrors(async (req, res) => {
  // get admin id
  const createdBy = req.user.id;
  let productsArray = [];
  productsArray = req.body;

  for (let i = 0; i < productsArray.length; i++) {
    let catid = "";
    const catRes = await Category.findOne({ name: productsArray[i].cat });
    if (catRes) {
      catid = catRes._id;
    } else {
      const newCat = await Category.create({
        name: productsArray[i].cat,
        color: gen_random_hex_color_code(),
      });

      catid = newCat._id;
    }

    let public_id = "";
    let url = "";

    const imageRes = await Media.findOne({ url: productsArray[i].image });
    public_id = imageRes.public_id;
    url = imageRes.url;

    const newProduct = {
      name: productsArray[i].name,
      code: productsArray[i].code,
      offer: productsArray[i].offer,
      price: productsArray[i].price,
      desc: productsArray[i].desc,
      cat: catid,
      status: productsArray[i].status,
      stock: productsArray[i].stock,
      image: [
        {
          public_id,
          url,
        },
      ],
      createdBy,
    };

    const productCheck = await Product.findOne({ name: productsArray[i].name });
    if (productCheck) {
      await Product.findByIdAndUpdate(productCheck._id, newProduct, {
        new: true,
        runValidators: true,
      });
    } else {
      await Product.create(newProduct);
    }
  }

  const productCount = await Product.countDocuments();

  const products = await Product.find({}).populate("cat", "name color");

  res.status(201).json({ success: true, products, productCount });
});

const createProduct = catchAsyncErrors(async (req, res) => {
  // get admin id
  const createdBy = req.user.id;
  const { name, code, offer, price, desc, cat, status, stock } = req.body;

  let newProduct = {};

  if (req.body.image) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Products",
      width: 150,
      crop: "scale",
      resource_type: "auto",
    });

    newProduct = {
      name,
      code,
      offer,
      price,
      desc,
      cat,
      status,
      stock,
      image: [
        {
          public_id: myCloud.public_id,
          url: myCloud.url,
        },
      ],
      createdBy,
    };
  } else {
    newProduct = {
      name,
      code,
      offer,
      price,
      desc,
      cat,
      status,
      stock,
      image: [
        {
          public_id: "Products/mvgmmvwdn5e8lqttgjtl",
          url: "https://res.cloudinary.com/dlyv2btpj/image/upload/v1677646356/Products/mvgmmvwdn5e8lqttgjtl.png",
        },
      ],
      createdBy,
    };
  }

  const product = await (await Product.create(newProduct)).populate("cat");
  res.status(201).json({ success: true, product });
});

//====================================== UPDATE FUNCTIONS ======================================

const updateStatusOfManyProducts = catchAsyncErrors(async (req, res, next) => {
  let productids = [];
  let status = "";
  productids = req.body.productids;
  status = req.body.status;

  for (let i = 0; i < productids.length; i++) {
    const product = await Product.findById(productids[i]);
    if (!product) {
      return next(new ErrorHandler(`Product ${productids[i]} not found`, 404));
    }

    product.status = status;
    await product.save();
  }

  const productCount = await Product.countDocuments();
  const products = await Product.find({}).populate("cat", "name color");

  // const products = await Product.find({});
  res.status(201).json({
    success: true,
    products,
    productCount,
    updatedCount: productids.length,
  });
});

const updateStockOfManyProducts = catchAsyncErrors(async (req, res, next) => {
  let productids = [];
  let stock = 0;
  productids = req.body.productids;
  stock = req.body.stock;

  for (let i = 0; i < productids.length; i++) {
    const product = await Product.findById(productids[i]);
    if (!product) {
      return next(new ErrorHandler(`Product ${productids[i]} not found`, 404));
    }

    product.stock = stock;
    await product.save();
  }

  const productCount = await Product.countDocuments();
  const products = await Product.find({}).populate("cat", "name color");

  // const products = await Product.find({});
  res.status(201).json({
    success: true,
    products,
    productCount,
    updatedCount: productids.length,
  });
});

const updateCategoryOfManyProducts = catchAsyncErrors(
  async (req, res, next) => {
    let productids = [];
    let categoryid = "";
    productids = req.body.productids;
    categoryid = req.body.categoryid;

    for (let i = 0; i < productids.length; i++) {
      const product = await Product.findById(productids[i]);
      if (!product) {
        return next(
          new ErrorHandler(`Product ${productids[i]} not found`, 404)
        );
      }

      product.cat = categoryid;
      await product.save();
    }

    const productCount = await Product.countDocuments();
    const products = await Product.find({}).populate("cat", "name color");

    // const products = await Product.find({});
    res.status(201).json({
      success: true,
      products,
      productCount,
      updatedCount: productids.length,
    });
  }
);

const updateOneProduct = catchAsyncErrors(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
    folder: "Products",
    width: 150,
    crop: "scale",
    resource_type: "auto",
  });

  const { name, code, offer, price, desc, cat, status, stock } = req.body;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id },
    {
      name,
      code,
      offer,
      price,
      desc,
      cat,
      status,
      stock,
      image: [
        {
          public_id: myCloud.public_id,
          url: myCloud.url,
        },
      ],
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("cat");

  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }

  // const products = await Product.find({});
  res.status(201).json({ success: true, product });
});

//====================================== DELETE FUNCTIONS ======================================

const deleteOneProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }
  const orders = await Order.find({ "orderItems.product": req.params.id });
  if (orders.length > 0) {
    orders.map(async (o, i) => {
      const newOrderItems = o.orderItems
        .slice()
        .filter((item) => item.product !== req.params.id);
      o.orderItems = newOrderItems;
      await o.save();
    });
  }

  for (let i = 0; i < product.image.length; i++) {
    const myCloudResult = await cloudinary.v2.uploader.destroy(
      product.image[i].public_id,
      {
        resource_type: "image",
      }
    );

    if (myCloudResult.result !== "ok") {
      return next(
        new ErrorHandler(`Image can't be deleted from cloudinary`, 404)
      );
    }
  }

  await product.remove();

  const products = await Product.find();
  const productCount = await Product.countDocuments();

  res.status(200).json({ success: true, products, productCount });
});

const deleteManyProducts = catchAsyncErrors(async (req, res, next) => {
  let productids = [];
  productids = req.body.productids;

  for (let i = 0; i < productids.length; i++) {
    const product = await Product.findById(productids[i]);
    if (!product) {
      return next(new ErrorHandler(`Product ${productids[i]} not found`, 404));
    }
    const orders = await Order.find({ "orderItems.product": productids[i] });
    if (orders.length > 0) {
      for (let j = 0; j < orders.length; j++) {
        const newOrderItems = orders[j].orderItems
          .slice()
          .filter((item) => item.product !== productids[i]);
        orders[j].orderItems = newOrderItems;
        await orders[j].save();
      }
    }

    for (let i = 0; i < product.image.length; i++) {
      const myCloudResult = await cloudinary.v2.uploader.destroy(
        product.image[i].public_id,
        {
          resource_type: "image",
        }
      );

      if (myCloudResult.result !== "ok") {
        return next(
          new ErrorHandler(`Image can't be deleted from cloudinary`, 404)
        );
      }
    }

    await product.remove();
  }

  const products = await Product.find();
  const productCount = await Product.countDocuments();

  res.status(200).json({
    success: true,
    products,
    productCount,
    deletedCount: productids.length,
  });
});

const deleteAllProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  products.forEach(async (product) => {
    const orders = await Order.find({ "orderItems.product": product._id });
    if (orders.length > 0) {
      for (let j = 0; j < orders.length; j++) {
        const newOrderItems = orders[j].orderItems
          .slice()
          .filter((item) => item.product !== product._id);
        orders[j].orderItems = newOrderItems;
        await orders[j].save();
      }
    }

    for (let i = 0; i < product.image.length; i++) {
      const myCloudResult = await cloudinary.v2.uploader.destroy(
        product.image[i].public_id,
        {
          resource_type: "image",
        }
      );

      if (myCloudResult.result !== "ok") {
        return next(
          new ErrorHandler(`Image can't be deleted from cloudinary`, 404)
        );
      }
    }
    await product.remove();
  });

  res.status(200).json({
    succes: true,
    message: `Successfully deleted all the products`,
  });
});

//====================================== GET FUNCTIONS ======================================

// both admin and client operations
const getAllProducts = catchAsyncErrors(async (req, res) => {
  const productCount = await Product.countDocuments();

  const products = await Product.find({}).populate("cat", "name color");

  if (!products) {
    return next(new ErrorHandler(`Products not found`, 404));
  }

  res.status(200).json({ succes: true, products, productCount });
});

const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "cat",
    "name"
  );

  if (!product) {
    return next(new ErrorHandler(`Product ${req.params.id} not found`, 404));
  }

  res.status(201).json({ success: true, product });
});

module.exports = {
  createProduct,
  createManyProducts,
  updateOneProduct,
  updateStatusOfManyProducts,
  updateStockOfManyProducts,
  updateCategoryOfManyProducts,
  deleteOneProduct,
  deleteAllProducts,
  deleteManyProducts,
  getAllProducts,
  getProductDetails,
};
