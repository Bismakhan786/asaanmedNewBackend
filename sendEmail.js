const nodeMailer = require("nodemailer");

const ejs = require("ejs");
const path = require("path");

const templatePath = path.join(__dirname, "./emailTemplateEJS.ejs");
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  service: "gmail",
  auth: {
    user: "asaanmedNew@gmail.com",
    pass: "zwmgwfknvzcdpibc",
  },
});

ejs.renderFile(
  templatePath,
  {
    orderId: "akdjcnsjkdfjsvn",
    orderDate: "2022-12-02",
    customerName: "BISMA KHAN",
    customerContact: "03362108399",
    orderTotal: 45612,
    streetAddress: "acysxx",
    floorOrApartment: "ac",
    city: "KARACHI",
    postalCode: 74600,
    paymentType: "COD",
    paymentStatus: "PENDING",
    orderItems: [
      {
        product: "ABOCAL",
        qty: 3,
        price: 250,
        offer: 10,
        total: 500,
      },
      {
        product: "ABOCAL",
        qty: 3,
        price: 250,
        offer: 10,
        total: 500,
      }
    ],
  },
  function (err, data) {
    if (err) {
      console.log(err);
    } else {
      const msg = {
        from: "asaanmedNew@gmail.com",
        to: "bismaashfaq009@gmail.com",
        subject: "An email from nodemailer asaanmed",
        html: data,
      };
      console.log("html data ======================>", msg.html);
      transporter.sendMail(msg, (err) => {
          if (err) {
            return console.log("Error occurs", err.message);
          } else {
            return console.log("Email sent");
          }
        });
    }
  }
);
