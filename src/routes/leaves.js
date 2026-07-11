"use strict";

const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authenticate } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
router.use(authenticate);
router
    .route("/")
    .get(leaveController.getAll)
    .post(upload.single("file"), leaveController.create);
router
    .route("/:id")
    .get(leaveController.getOne)
    .patch(upload.single("file"), leaveController.update)
    .delete(leaveController.delete);
router.patch("/:id/status", leaveController.updateStatus);
module.exports = router;
