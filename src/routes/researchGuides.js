"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Public/authenticated access to list research guides
router.get("/", userController.getResearchGuides);

module.exports = router;
