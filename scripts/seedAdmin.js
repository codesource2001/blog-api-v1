require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const path = require("path");
const config = require(path.join(__dirname, "../src/config"));
const { User } = require(path.join(__dirname, "../src/models"));

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.MONGO_URI);
      console.log("✓ Connected to MongoDB");
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@example.com",
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("admin123", salt);

    // Create admin user
    const adminUser = await User.create({
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✓ Admin user created successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log("─".repeat(40));
    console.log(`  Email:    admin@example.com`);
    console.log(`  Password: admin123`);
    console.log("─".repeat(40));
    console.log("\n🔗 Admin Login URL:");
    console.log(
      `  ${config.HOST === "0.0.0.0" ? "http://localhost" : `http://${config.HOST}`}:${config.PORT}/admin/login`,
    );

    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding admin user:", error.message);
    process.exit(1);
  }
};

seedAdminUser();
