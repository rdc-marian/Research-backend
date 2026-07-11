"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
// Public routes (e.g. for the landing page directory)
router.get("/", userController.getAll);
router.get("/:id", userController.getOne);
// Public route for PendingApproval registration, protected for admin/active creation
router.post("/", (req, res, next) => {
    if (req.body && req.body.status === "PendingApproval") {
        const userRoles = req.body.roles || [req.body.role];
        const hasAdminRole = userRoles.some((role) => role === "admin");
        if (hasAdminRole) {
            return res.status(403).json({ message: "Cannot register as administrator" });
        }
        return next();
    }
    authenticate(req, res, (err) => {
        if (err) return next(err);
        authorizeRoles(["admin"])(req, res, next);
    });
}, userController.create);
router.patch("/:id", authenticate, userController.update);
router.delete("/:id", authenticate, authorizeRoles(["admin"]), userController.delete);
module.exports = router;
