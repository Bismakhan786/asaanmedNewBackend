const mongoose = require("mongoose");

const ConnectDB = (url) => {
  return mongoose
    .connect(url)
    .then((data) => console.log(`CONNECTED TO DB: ${data.connection.port}`))
};

module.exports = ConnectDB;