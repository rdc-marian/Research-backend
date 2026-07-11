"use strict";

const express = require("express");
const router = express.Router();
const scholarProgressController = require("../controllers/scholarProgressController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router.get("/", scholarProgressController.getByScholar);
router.post("/", scholarProgressController.upsert);
router.patch("/", scholarProgressController.upsert);
module.exports = router;
