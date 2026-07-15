"use strict";

const express = require("express");
const router = express.Router();
const researchCenterController = require("../controllers/researchCenterController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

router.use(authenticate);

router
    .route("/")
    .get(researchCenterController.getAll)
    .post(authorizeRoles(["admin"]), researchCenterController.create);

router
    .route("/:id")
    .get(researchCenterController.getOne)
    .patch(authorizeRoles(["admin"]), researchCenterController.update)
    .delete(authorizeRoles(["admin"]), researchCenterController.delete);

router.patch("/:id/status", authorizeRoles(["admin"]), researchCenterController.updateStatus);
router.get("/:id/guides", researchCenterController.getGuides);
router.get("/:id/faculty", researchCenterController.getFaculty);
router.get("/:id/scholars", researchCenterController.getScholars);

module.exports = router;
