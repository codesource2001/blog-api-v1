const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { protect, restrictTo } = require("../middlewares");

// This route is protected. Only authenticated users can access it.
router.get("/me", protect, userController.getMe);

// Example of a restricted route (only admins)
router.get("/admin-only", protect, restrictTo("admin"), userController.getMe);

module.exports = router;
