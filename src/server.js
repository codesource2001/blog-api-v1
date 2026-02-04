const express = require("express");
const app = express();
const routes = require("./routes");

app.use("/", routes.testRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error!";
  res.status(err.statusCode).json({ success: false, error: err.message });
  next();
});

module.exports = app;
