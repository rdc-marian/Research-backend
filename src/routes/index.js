"use strict";

const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const userRoutes = require("./users");
const researchCenterRoutes = require("./researchCenters");
const submissionRoutes = require("./submissions");
const leaveRoutes = require("./leaves");
const portfolioRoutes = require("./portfolio");
const qualificationRoutes = require("./qualifications");
const publicationRoutes = require("./publications");
const conferenceRoutes = require("./conferences");
const patentRoutes = require("./patents");
const workshopRoutes = require("./workshops");
const membershipRoutes = require("./memberships");
const scholarshipRoutes = require("./scholarships");
const projectRoutes = require("./projects");
const grantRoutes = require("./grants");
const guidanceRoutes = require("./guidance");
const awardRoutes = require("./awards");
const consultancyRoutes = require("./consultancy");
const resourcePersonRoutes = require("./resourcePerson");
const collaborationRoutes = require("./collaborations");
const scholarProgressRoutes = require("./scholarProgress");
const profileRoutes = require("./profile");
const incentiveRoutes = require("./incentives");
const reportRoutes = require("./reports");
const settingsRoutes = require("./settings");
const uploadRoutes = require("./uploads");
const healthRoutes = require("./health");
const researchGuidesRoutes = require("./researchGuides");
const submissionController = require("../controllers/submissionController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const researchCenterController = require("../controllers/researchCenterController");
const { authenticate } = require("../middleware/auth");

// ==========================================
// 1. Genuinely Public Routes (No Auth Barrier)
// ==========================================

// Health check
router.use("/health", healthRoutes);

// Auth login
router.post("/auth/login", authController.login);

// Public dropdowns & registers
router.use("/research-guides", researchGuidesRoutes);
router.get("/research-centers", researchCenterController.getAll);
router.get("/research-centres", researchCenterController.getAll);

// Public user registration
router.post("/users", (req, res, next) => {
    if (req.body && req.body.status === "PendingApproval") {
        const userRoles = req.body.roles || [req.body.role];
        const hasAdminRole = userRoles.some((role) => role === "admin");
        if (hasAdminRole) {
            return res.status(403).json({ message: "Cannot register as administrator" });
        }
        return userController.create(req, res, next);
    }
    next();
});

// ==========================================
// 2. Centralized Authentication Barrier
// ==========================================
router.use(authenticate);

// ==========================================
// 3. Protected Route Groups (Require Token)
// ==========================================
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/research-centers", researchCenterRoutes);
router.use("/research-centres", researchCenterRoutes);
router.use("/submissions", submissionRoutes);
router.use("/leaves", leaveRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/qualifications", qualificationRoutes);
router.use("/publications", publicationRoutes);
router.use("/conferences", conferenceRoutes);
router.use("/patents", patentRoutes);
router.use("/workshops", workshopRoutes);
router.use("/memberships", membershipRoutes);
router.use("/scholarships", scholarshipRoutes);
router.use("/projects", projectRoutes);
router.use("/grants", grantRoutes);
router.use("/guidance", guidanceRoutes);
router.use("/awards", awardRoutes);
router.use("/consultancy", consultancyRoutes);
router.use("/resource-person", resourcePersonRoutes);
router.use("/resourcePerson", resourcePersonRoutes);
router.use("/collaborations", collaborationRoutes);
router.use("/scholar-progress", scholarProgressRoutes);
router.use("/scholarProgress", scholarProgressRoutes);
router.use("/profile", profileRoutes);
router.use("/incentives", incentiveRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);
router.use("/uploads", uploadRoutes);

// Directly map submission status checks for approvals report
router.get("/approvals", submissionController.getAll);

module.exports = router;
