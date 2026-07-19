"use strict";

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Public login route (also mounted publicly in index.js, but kept here for completeness)
router.post("/login", authController.login);
// Protected route to get currently authenticated user details
router.get("/me", authController.getMe);
// Protected logout route
router.post("/logout", authController.logout);

// Protected change-password route
router.post("/change-password", authController.changePassword);
router.patch("/change-password", authController.changePassword);

module.exports = router;
