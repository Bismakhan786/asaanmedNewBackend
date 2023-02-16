const app = require("./app");
const dotenv = require("dotenv");
const ConnectDB = require("./config/database");
const cloudinary = require('cloudinary')

//Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

dotenv.config({ path: "config/config.env" });

// port number and mongodb atlas connection string
const PORT = process.env.PORT || 5000;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const server = app.listen(PORT, () =>
  console.log(`Server is listening on http://localhost:${PORT}...`)
);

// connecting to database
ConnectDB(CONNECTION_STRING);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


// UNhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
