const express = require("express");
const healthRoutes = require("./health");
const userRoutes = require("./users");
const departmentRoutes = require("./departments");
const submissionRoutes = require("./submissions");
const approvalRoutes = require("./approvals");
const reportRoutes = require("./reports");
const settingsRoutes = require("./settings");
const uploadRoutes = require("./uploads");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/submissions", submissionRoutes);
router.use("/approvals", approvalRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);
router.use("/uploads", uploadRoutes);

module.exports = router;
