const nodeMailer = require("nodemailer");

const msg = {
  from: "asaanmedNew@gmail.com",
  to: "bismaashfaq009@gmail.com",
  subject: "An email from nodemailer asaanmed",
  html: `<body>
  <h2>Order Details</h2>
  <h5 >Order ID: <span>slkdjsfbshkfhskjfbsk</span></h5>
  <h5 >Date: <span>2022-03-01</span></h5>
  <h5 >Name: <span>Bisma Khan</span></h5>
  <h5 >Contact: <span>03362108399</span></h5>
  <div >
      <h2>Items</h2>
      <table style="width: 90%;">
            <thead>
                <th>
                    <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.8); padding-bottom: 5px; margin-bottom: 5px;">
                        <th style="padding-right: 5px; text-align: left;">Product</th>
                        <th style="padding-right: 5px; text-align: left;">Quantity</th>
                        <th style="padding-right: 5px; text-align: left;">Price</th>
                        <th style="padding-right: 5px; text-align: left;">Offer</th>
                        <th style="padding-right: 5px; text-align: left;">Total</th>
                    </tr>
                </th>
            </thead>
            <tbody>
                 <tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.8); padding-bottom: 5px; margin-bottom: 5px;">
                    <td style="text-align: left; padding-right: 5px;">ABOCAL</td>
                    <td style="text-align: left; padding-right: 5px;">3</td>
                    <td style="text-align: left; padding-right: 5px;">250</td>
                    <td style="text-align: left; padding-right: 5px;">10</td>
                    <td style="text-align: left; padding-right: 5px;">2550</td>
                </tr>
            </tbody>
        </table>
  
      <h5>Shipping Details</h5>
      <p>F14 NOOR APARTMENT BLOCK K</p>
     <p>First floor d7</p>
     <p>Karachi</p>
     <p>74600</p>
     <h5>Payment Details</h5>
      <p>Cash on delivery</p>
      <p>Pending</p>
  
</body>`,
};

nodeMailer
  .createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "gmail",
    auth: {
      user: "asaanmedNew@gmail.com",
      pass: "zwmgwfknvzcdpibc",
    },
  })
  .sendMail(msg, (err) => {
    if (err) {
      return console.log("Error occurs", err.message);
    } else {
      return console.log("Email sent");
    }
  });
