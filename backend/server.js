const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((con) => {
    console.log("Connection established!!");
  })
  .catch((err) => {
    console.log("Error!!! , Failed to connect", err.name);
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log("Greetings Sir port ${port} is up and running");
  console.log(process.env.NODE_ENV);
});
