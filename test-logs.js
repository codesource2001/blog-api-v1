/**
 * Test script to verify Socket.IO log emission
 * Usage: node test-logs.js
 */

const io = require("socket.io-client");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("./src/config");
const connectDB = require("./src/database/db");
const User = require("./src/models/user.model");

async function test() {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Get admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ No admin user found. Run: npm run seed:admin");
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${admin.email}`);

    // Create a valid token
    const token = jwt.sign({ id: admin._id }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("🔌 Attempting to connect to Socket.IO...");
    console.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);

    const socket = io("http://localhost:4001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      extraHeaders: {
        cookie: `accessToken=${token}`,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO successfully!");
    });

    socket.on("log", (data) => {
      console.log("📝 Log received:", {
        level: data.level,
        message: data.message,
        timestamp: data.timestamp,
        service: data.service,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO");
      process.exit(0);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Keep script running for 20 seconds to receive logs
    setTimeout(() => {
      console.log("\n⏱️ Test timeout reached. Closing connection...");
      socket.disconnect();
      process.exit(0);
    }, 20000);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

test();
