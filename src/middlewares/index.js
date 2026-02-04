module.exports = {
  // Refactored code for better readability and maintainability
  ...require("./auth.middleware"),
  ...require("../validators/auth.validator"),
  ...require("./logger.middleware"),
  ...require("./correlation.middleware"),
  ...require("./rateLimit.middleware"),
};
