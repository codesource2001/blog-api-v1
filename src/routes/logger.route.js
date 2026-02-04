const express = require("express");
const router = express.Router();
const { loggerController } = require("../controllers");
const { protect, restrictTo } = require("../middlewares");

// Protect logs so only admins can view them
// router.get("/:type", protect, restrictTo("admin"), loggerController.getLogs);
router.get("/dashboard", protect, restrictTo("admin"), loggerController.getDashboard);
router.get("/:type", loggerController.getLogs);

module.exports = router;
