const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middlewares");

router.get("/", protect, restrictTo("admin"), adminController.getDashboard);
router.get("/login", adminController.getLogin);
router.post("/login", adminController.login);

module.exports = router;
