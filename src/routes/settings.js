"use strict";

const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
router.use(authenticate);
router.post("/clear-db", authorizeRoles("admin"), settingsController.clearDatabase);
router
    .route("/")
    .get(settingsController.get)
    .put(settingsController.update)
    .patch(settingsController.update);
module.exports = router;
