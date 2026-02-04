const crypto = require("crypto");
const { context } = require("../utils");

const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  res.setHeader("X-Correlation-ID", correlationId);

  context.run({ correlationId }, () => {
    next();
  });
};

module.exports = { correlationMiddleware };
