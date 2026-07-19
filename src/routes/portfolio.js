"use strict";

const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");

router.get("/summary", portfolioController.getSummary);
router.get("/approvals", portfolioController.getApprovals);
module.exports = router;
