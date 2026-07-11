"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router.get("/summary", reportController.getSummary);
module.exports = router;
