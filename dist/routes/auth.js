"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
// Protected change-password routes (supports both POST and PATCH)
router.post("/change-password", authenticate, authController.changePassword);
router.patch("/change-password", authenticate, authController.changePassword);
module.exports = router;
