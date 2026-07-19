"use strict";

const express = require("express");
const router = express.Router();
const researchCenterController = require("../controllers/researchCenterController");
const { authorizeRoles } = require("../middleware/auth");

// Public route for landing page / registration dropdowns (also handled publicly in index.js)
router.get("/", researchCenterController.getAll);

router.post("/", authorizeRoles(["admin"]), researchCenterController.create);

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
