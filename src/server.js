const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const routes = require("./routes");
const config = require("./config");
const { logger } = require("./utils");
const {
  requestLogger,
  correlationMiddleware,
  limiter,
} = require("./middlewares");

// Middlewares
app.use(express.json()); // for parsing application/json from req.body
app.use(express.urlencoded({ extended: true })); // for parsing form data from req.body
app.use(cors()); // enable Cross-Origin Resource Sharing
app.use(cookieParser()); // for parsing cookies from req.cookies
app.use(correlationMiddleware); // Generate/propagate correlation ID
app.use(requestLogger); // Log all incoming requests
app.use(express.static("public")); // Serve static files from the 'public' directory
app.use(limiter); // Apply rate limiting to all requests

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use("/", routes.testRouter); // Assuming this is for testing, can be removed or kept
app.use("/auth", routes.authRouter);
app.use("/users", routes.userRouter);
app.use("/logs", routes.loggerRouter);

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const isDevelopment = config.NODE_ENV === "development";

  logger.error(err); // Log the error using winston

  res.status(statusCode).json({
    success: false,
    // Only show detailed error messages for client errors (4xx) in production
    error:
      isDevelopment || statusCode < 500 ? message : "Internal Server Error",
    ...(isDevelopment && { stack: err.stack }), // Only show stack in development
  });
});

module.exports = app;
