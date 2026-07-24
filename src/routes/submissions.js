"use strict";

const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { authenticate } = require("../middleware/auth");
const { memoryUpload } = require("../middleware/memoryUpload");
router.use(authenticate);
router
    .route("/")
    .get(submissionController.getAll)
    .post(memoryUpload.single("file"), submissionController.create);
router
    .route("/:id")
    .get(submissionController.getOne)
    .patch(memoryUpload.single("file"), submissionController.update)
    .delete(submissionController.delete);
router.patch("/:id/status", submissionController.updateStatus);
module.exports = router;
