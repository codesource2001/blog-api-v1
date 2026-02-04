const mongoose = require("mongoose");
const config = require("../config");
const { logger } = require("../utils");

const connectDB = async () => {
  try {
    if (!config.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGO_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      logger.info("MongoDB connected");
    } else {
      logger.info("MongoDB already connected");
    }
  } catch (error) {
    throw new Error("Failed to connect to MongoDB:" + error.message);
  }
};

module.exports = connectDB;
