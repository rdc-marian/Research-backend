"use strict";

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
// Public login route
router.post("/login", authController.login);
// Protected route to get currently authenticated user details
router.get("/me", authenticate, authController.getMe);
// Protected logout route
router.post("/logout", authController.logout);

// Protected change-password route
router.post("/change-password", authenticate, authController.changePassword);
router.patch("/change-password", authenticate, authController.changePassword);

module.exports = router;
