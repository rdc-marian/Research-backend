"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const incentiveController = require("../controllers/incentiveController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router
    .route("/")
    .get(incentiveController.getAll)
    .post(incentiveController.create);
router.patch("/:id/status", incentiveController.updateStatus);
module.exports = router;
