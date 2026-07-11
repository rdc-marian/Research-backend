"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
// Public routes (e.g. for the landing page directory)
router.get("/", userController.getAll);
router.get("/:id", userController.getOne);
// Protected routes (admin/authenticated only)
router.post("/", authenticate, authorizeRoles(["admin"]), userController.create);
router.patch("/:id", authenticate, authorizeRoles(["admin"]), userController.update);
router.delete("/:id", authenticate, authorizeRoles(["admin"]), userController.delete);
module.exports = router;
