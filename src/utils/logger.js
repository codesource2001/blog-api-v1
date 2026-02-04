const winston = require("winston");
const config = require("../config");
const { getIO } = require("./socket");
const context = require("./context");

class SocketTransport extends winston.Transport {
  log(info, callback) {
    const io = getIO();
    if (io) {
      // Emit only to clients in the 'admin-logs' room
      io.to("admin-logs").emit("log", info);
    }
    callback();
  }
}

const addCorrelationId = winston.format((info) => {
  const store = context.getStore();
  if (store && store.correlationId) {
    info.correlationId = store.correlationId;
  }
  return info;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    addCorrelationId(),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "blog-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new SocketTransport(),
  ],
});

// In development, add a console transport with a simple, colorized format for readability.
if (config.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
} else {
  // In production, it's common to log to the console in JSON format for log aggregators.
  logger.add(new winston.transports.Console());
}

module.exports = logger;
