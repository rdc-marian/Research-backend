"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { authenticate } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
router.use(authenticate);
router
    .route("/")
    .get(submissionController.getAll)
    .post(upload.single("file"), submissionController.create);
router
    .route("/:id")
    .get(submissionController.getOne)
    .patch(upload.single("file"), submissionController.update)
    .delete(submissionController.delete);
router.patch("/:id/status", submissionController.updateStatus);
module.exports = router;
