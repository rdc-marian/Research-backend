"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authorizeRoles } = require("../middleware/auth");

router.get("/", userController.getAll);
router.get("/:id", userController.getOne);

// Only admins can create users directly (public registration is handled in index.js)
router.post("/", authorizeRoles(["admin"]), userController.create);

router.patch("/:id", userController.update);

router.delete("/:id", (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.userId === req.params.id)) {
        return next();
    }
    return res.status(403).json({ message: "Forbidden" });
}, userController.delete);

module.exports = router;
