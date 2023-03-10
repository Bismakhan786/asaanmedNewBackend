const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");

app.use(
  cors({
    origin: ["https://amused-peplum-boa.cyclic.app", 'http://localhost:3000' , 'http://10.0.2.2:4000','exp://192.168.100.8:19000'],
    credentials: true
  })
);


const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middleware/error");

app.use(express.json({limit: '100mb'}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(fileupload());



//import router
const product = require("./routes/Product");
const order = require("./routes/Order");
const admin = require("./routes/Admin");
const mobileUser = require("./routes/MobileUser")

app.use("/api/v1/products", product);
app.use("/api/v1/orders", order);
app.use("/api/v1/admin", admin);
app.use("/api/v1/mobile/users", mobileUser)

// middleware for errors
app.use(errorMiddleware);


app.use(express.static(path.join(__dirname, "./build")))

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./build/index.html"))
})


module.exports = app;
