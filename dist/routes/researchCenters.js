"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
module.exports = router;
