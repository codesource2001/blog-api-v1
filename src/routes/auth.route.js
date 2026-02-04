const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { validateAuth } = require("../middlewares");

router.post("/signup", validateAuth, authController.signup);
router.post("/login", validateAuth, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.get("/logout", authController.logout);

module.exports = router;
