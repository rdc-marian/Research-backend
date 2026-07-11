"use strict";

const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
// Public routes
router.get("/", departmentController.getAll);
router.get("/:id", departmentController.getOne);
// Protected routes (admin only)
router.post("/", authenticate, authorizeRoles(["admin"]), departmentController.create);
router.patch("/:id", authenticate, authorizeRoles(["admin"]), departmentController.update);
module.exports = router;
