require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB } = require("../src/config/db");

// Import all models
const User = require("../src/models/User");
const ResearchCenter = require("../src/models/ResearchCenter");
const Submission = require("../src/models/Submission");
const LeaveApplication = require("../src/models/LeaveApplication");
const SystemSettings = require("../src/models/SystemSettings");
const Incentive = require("../src/models/Incentive");
const Qualification = require("../src/models/Qualification");
const Publication = require("../src/models/Publication");
const Conference = require("../src/models/Conference");
const Patent = require("../src/models/Patent");
const Workshop = require("../src/models/Workshop");
const Membership = require("../src/models/Membership");
const Scholarship = require("../src/models/Scholarship");
const ResearchProject = require("../src/models/ResearchProject");
const ResearchGrant = require("../src/models/ResearchGrant");
const ResearchGuidance = require("../src/models/ResearchGuidance");
const Award = require("../src/models/Award");
const Consultancy = require("../src/models/Consultancy");
const ResourcePerson = require("../src/models/ResourcePerson");
const Collaboration = require("../src/models/Collaboration");
const ScholarProgress = require("../src/models/ScholarProgress");
const ResearchProfile = require("../src/models/ResearchProfile");

const run = async () => {
  await connectDB();

  console.log("Cleaning database collections...");
  await Promise.all([
    User.deleteMany(),
    ResearchCenter.deleteMany(),
    Submission.deleteMany(),
    LeaveApplication.deleteMany(),
    SystemSettings.deleteMany(),
    Incentive.deleteMany(),
    Qualification.deleteMany(),
    Publication.deleteMany(),
    Conference.deleteMany(),
    Patent.deleteMany(),
    Workshop.deleteMany(),
    Membership.deleteMany(),
    Scholarship.deleteMany(),
    ResearchProject.deleteMany(),
    ResearchGrant.deleteMany(),
    ResearchGuidance.deleteMany(),
    Award.deleteMany(),
    Consultancy.deleteMany(),
    ResourcePerson.deleteMany(),
    Collaboration.deleteMany(),
    ScholarProgress.deleteMany(),
    ResearchProfile.deleteMany(),
  ]);

  console.log("Generating default password hash...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Core Users (Admins, Coordinators, Library)
  console.log("Creating administrative users...");
  const admin = await User.create({
    name: "Admin",
    email: "admin@univ.edu",
    role: "admin",
    roles: ["admin"],
    password: hashedPassword,
    status: "Active",
  });

  const coordinator = await User.create({
    name: "test coordinator",
    email: "coordinator@univ.edu",
    role: "coordinator",
    roles: ["coordinator"],
    password: hashedPassword,
    phone: "9876543210",
    status: "Active",
  });

  const library = await User.create({
    name: "test library",
    email: "library@univ.edu",
    role: "library",
    roles: ["library"],
    password: hashedPassword,
    status: "Active",
  });

  // 2. Create Research Centers
  console.log("Creating research centers...");
  const researchCenters = await ResearchCenter.insertMany([
    {
      name: "Computer Science Research Center",
      code: "CSRC",
      coordinator: admin._id,
      status: "Active",
    },
    {
      name: "Information Technology Research Center",
      code: "ITRC",
      coordinator: admin._id,
      status: "Active",
    },
    {
      name: "Electronics Research Center",
      code: "ECRC",
      coordinator: admin._id,
      status: "Active",
    },
    {
      name: "MCA Research Center",
      code: "MCA",
      coordinator: coordinator._id,
      status: "Active",
    },
  ]);

  const csCenter = researchCenters.find((c) => c.code === "CSRC");
  const itCenter = researchCenters.find((c) => c.code === "ITRC");
  const eceCenter = researchCenters.find((c) => c.code === "ECRC");
  const mcaCenter = researchCenters.find((c) => c.code === "MCA");

  // 3. Create Guides/Faculty Users
  console.log("Creating faculty/guide users...");
  const mcaGuide = await User.create({
    name: "Dr. Elizabeth Paul",
    email: "elizabeth.paul@univ.edu",
    role: "faculty",
    roles: ["faculty", "research_guide"],
    password: hashedPassword,
    status: "Active",
    researchCenter: mcaCenter._id,
  });

  const csGuide = await User.create({
    name: "Dr. Emily Davis",
    email: "emily.davis@univ.edu",
    role: "faculty",
    roles: ["faculty", "research_guide"],
    password: hashedPassword,
    status: "Active",
    researchCenter: csCenter._id,
  });

  const itGuide = await User.create({
    name: "Dr. Kiran Nair",
    email: "kiran.nair@univ.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    password: hashedPassword,
    status: "Active",
    researchCenter: itCenter._id,
  });

  const eceGuide = await User.create({
    name: "Dr. Anita George",
    email: "anita.george@univ.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    password: hashedPassword,
    status: "Active",
    researchCenter: eceCenter._id,
  });

  // 4. Create Scholars
  console.log("Creating scholar users...");
  const scholars = await User.insertMany([
    {
      name: "Albin Joseph",
      email: "albin@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      password: hashedPassword,
      status: "Active",
      researchCenter: mcaCenter._id,
      guide: mcaGuide._id,
    },
    {
      name: "Binu Thomas",
      email: "binu@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      password: hashedPassword,
      status: "Active",
      researchCenter: mcaCenter._id,
      guide: mcaGuide._id,
    },
    {
      name: "Chitra Nair",
      email: "chitra@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      password: hashedPassword,
      status: "Active",
      researchCenter: mcaCenter._id,
      guide: mcaGuide._id,
    },
    {
      name: "John Smith",
      email: "john.smith@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      password: hashedPassword,
      status: "Active",
      researchCenter: csCenter._id,
      guide: csGuide._id,
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      password: hashedPassword,
      status: "Active",
      researchCenter: eceCenter._id,
      guide: eceGuide._id,
    },
  ]);

  const albin = scholars.find((s) => s.email === "albin@univ.edu");
  const binu = scholars.find((s) => s.email === "binu@univ.edu");
  const john = scholars.find((s) => s.email === "john.smith@univ.edu");
  const sarah = scholars.find((s) => s.email === "sarah.wilson@univ.edu");

  // 5. Create Submissions
  console.log("Creating submissions...");
  await Submission.insertMany([
    {
      title: "AI in Healthcare diagnostic systems",
      abstract: "Explores AI applications for diagnostics and patient monitoring.",
      scholar: john._id,
      supervisor: csGuide._id,
      status: "Pending",
      submittedAt: new Date("2026-05-15T09:00:00.000Z"),
      file: { url: "/api/uploads/sample-ai-health.pdf", originalName: "AI_Healthcare.pdf" }
    },
    {
      title: "Smart Cities and IoT optimization",
      abstract: "IoT-driven frameworks for smart city services.",
      scholar: sarah._id,
      supervisor: eceGuide._id,
      status: "Approved",
      submittedAt: new Date("2026-05-10T11:00:00.000Z"),
      reviewedAt: new Date("2026-05-12T12:00:00.000Z"),
      reviewer: admin._id,
      file: { url: "/api/uploads/sample-iot.pdf", originalName: "Smart_Cities_IoT.pdf" }
    }
  ]);

  // 6. Create Leaves (None seeded by default)
  // 7. Create Accomplishments (None seeded by default)

  // 8. Create Incentives (for faculty)
  console.log("Creating incentives...");
  await Incentive.insertMany([
    {
      faculty: mcaGuide._id,
      facultyName: mcaGuide.name,
      facultyEmail: mcaGuide.email,
      category: "Publication",
      amountRequested: 5000,
      status: "Pending Library",
      publicationTitle: "Advanced AI Architectures",
      journalName: "IEEE Transactions on AI",
      doiLink: "https://doi.org/10.1109/TAI.2026.001",
      pubStatus: "Published",
      libraryNote: "Details correct. Processing.",
    },
    {
      faculty: mcaGuide._id,
      facultyName: mcaGuide.name,
      facultyEmail: mcaGuide.email,
      category: "Patent",
      amountRequested: 10000,
      status: "Approved",
      patentTitle: "Decentralized Key Value Store Model",
      patentNumber: "US/12345/A1",
      patentStatus: "Granted",
      adminNote: "Recommended for incentive payout.",
    }
  ]);

  // 9. Create ScholarProgress & ResearchProfile
  console.log("Creating progress tracking and research profiles...");
  for (const s of scholars) {
    await ScholarProgress.create({
      scholar: s._id,
      guide: s.guide,
      admissionDetails: {
        registrationDate: new Date("2024-08-01"),
        registrationNumber: `REG-${s.name.toUpperCase().replace(" ", "-")}-2024`,
        admissionType: "Full Time"
      },
      courseworkCompletion: {
        status: "Completed",
        completionDate: new Date("2025-05-15")
      },
      synopsisSubmission: {
        status: "Not Submitted"
      },
      thesisSubmission: {
        status: "Not Submitted"
      },
      vivaVoceStatus: {
        status: "Pending"
      }
    });

    await ResearchProfile.create({
      userId: s._id,
      facultyId: `SCH-${s.name.toUpperCase().replace(" ", "-")}`,
      designation: "Research Scholar",
      dateOfJoining: new Date("2024-08-01"),
      orcidId: "0000-0002-1825-0097",
      scopusId: "57211349000",
      majorResearchAreas: ["Artificial Intelligence", "Computer Vision"],
      keywords: ["deep learning", "CNN", "segmentation"]
    });
  }

  // 10. Create SystemSettings
  console.log("Creating system settings...");
  await SystemSettings.create({
    systemName: "MarianResearch Portal",
    organization: "Marian College Kuttikkanam",
    timezone: "GMT+05:30",
    dateFormat: "dd/mm/yyyy",
  });

  console.log("Seed complete successfully.");
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
