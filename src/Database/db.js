const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  try {
    if (
      config.MONGO_URI === null ||
      config.MONGO_URI === undefined ||
      config.MONGO_URI === "" ||
      typeof config.MONGO_URI !== "string" ||
      config.MONGO_URI.trim() === "" ||
      !config.MONGO_URI
    ) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGO_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
    } else {
      console.log("MongoDB already connected");
    }
  } catch (error) {
    throw new Error("Failed to connect to MongoDB:" + error.message);
  }
};

module.exports = connectDB;
