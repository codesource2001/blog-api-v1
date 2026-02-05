const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
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

// ============================================================================
// SECURITY MIDDLEWARE - Applied in order of importance
// ============================================================================

// 1. Set security HTTP headers (Helmet.js)
// Protects against various vulnerabilities like XSS, clickjacking, MIME sniffing, etc.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: "deny", // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME sniffing
    xssFilter: true, // Enable XSS filter
  }),
);

// 2. CORS Configuration - Restrict origins in production
app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? [process.env.ALLOWED_ORIGINS || "http://localhost:4001"]
        : "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 3. Body Parser Middleware - with size limits to prevent payload abuse
app.use(express.json({ limit: "10kb" })); // Limit JSON payload to 10KB
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Limit form data to 10KB

// 4. Cookie Parser - for secure cookie handling
app.use(cookieParser());

// 5. Data Sanitization - protect against NoSQL injection
// Removes $ and . from req.body, req.query, req.params to prevent MongoDB injection
app.use(
  mongoSanitize({
    replaceWith: "_", // Replace dangerous characters with underscore
    onSanitize: ({ req, key }) => {
      logger.warn(`Sanitized key in ${key}: potential NoSQL injection attempt`);
    },
  }),
);

// 6. Parameter Pollution Protection (HPP)
// Prevent HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      // List of query parameters that are allowed to have multiple values
      "sort",
      "fields",
      "page",
      "limit",
    ],
  }),
);

// 7. Request Correlation ID - Track requests across the system
app.use(correlationMiddleware);

// 8. Request Logging - Log all incoming requests
app.use(requestLogger);

// 9. Rate Limiting - Protect against brute force and DoS attacks
app.use(limiter);

// 10. Static Files - Serve only necessary public assets
app.use(express.static("public"));

// ============================================================================
// APPLICATION SETUP
// ============================================================================

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================================================
// ROUTES
// ============================================================================

// app.use("/", routes.testRouter); // Assuming this is for testing, can be removed or kept
app.use("/auth", routes.authRouter);
app.use("/users", routes.userRouter);
app.use("/logs", routes.loggerRouter);

// ============================================================================
// ERROR HANDLING & SECURITY
// ============================================================================

// 404 Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Resource not found",
  });
});

// Centralized Error Handler - with security considerations
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const isDevelopment = config.NODE_ENV === "development";

  logger.error({
    error: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
  }); // Log the error using winston

  // Don't expose sensitive error details in production
  const errorResponse = {
    success: false,
    error:
      isDevelopment || statusCode < 500 ? message : "Internal Server Error",
  };

  // Include stack trace only in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

module.exports = app;
