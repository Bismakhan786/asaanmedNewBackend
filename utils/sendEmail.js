const nodeMailer = require("nodemailer");
const ejs = require('ejs')
const path = require('path')

const sendEmail = async ({
  orderId,
  orderDate,
  orderStatus,
  customerName,
  customerContact,
  orderTotal,
  streetAddress,
  floorOrApartment,
  city,
  postalCode,
  paymentType,
  paymentStatus,
  orderItems = [{
    product: "",
    qty: "",
    price: "",
    offer: "",
    total: ""
  }],
  
}) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const templatePath = path.join(__dirname, "./emailTemplateEJS.ejs")
  const data = await ejs.renderFile(templatePath, {
    orderId,
    orderDate,
    customerName,
    customerContact,
    orderTotal,
    streetAddress,
    floorOrApartment,
    city,
    postalCode,
    paymentType,
    paymentStatus,
    orderItems
  })

  const msg = {
    from: `"ASAANMED" ${process.env.SMTP_MAIL}`,
    to: process.env.ADMIN_EMAIL,
    subject: orderStatus === "Cancelled" ? "ORDER CANCELLED" : "NEW ORDER",
    html: data,
  };

  await transporter.sendMail(msg, (err) => {
    if (err) {
      return console.log("Error occurs", err.message);
    } else {
      return console.log("Email sent");
    }
  });
};

module.exports = sendEmail;
