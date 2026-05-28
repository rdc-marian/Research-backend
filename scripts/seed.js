require("dotenv").config();
const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Department = require("../src/models/Department");
const Submission = require("../src/models/Submission");
const SystemSettings = require("../src/models/SystemSettings");

const run = async () => {
  await connectDB();

  const shouldReset = process.env.SEED_RESET === "true";
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0 && !shouldReset) {
    console.log("Seed skipped: data already exists. Set SEED_RESET=true to overwrite.");
    process.exit(0);
  }

  if (shouldReset) {
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Submission.deleteMany(),
      SystemSettings.deleteMany(),
    ]);
  }

  const users = await User.insertMany([
    {
      name: "Admin User",
      email: "admin@univ.edu",
      role: "admin",
      department: "Administration",
      status: "Active",
    },
    {
      name: "Dr. Priya Sharma",
      email: "priya.sharma@college.edu",
      role: "coordinator",
      department: "MCA - Master of Computer Applications",
      phone: "9876543210",
      status: "Active",
    },
    {
      name: "Dr. Emily Davis",
      email: "emily.davis@univ.edu",
      role: "faculty",
      department: "Computer Science",
      status: "Active",
    },
    {
      name: "John Smith",
      email: "john.smith@univ.edu",
      role: "scholar",
      department: "Computer Science",
      status: "Active",
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@univ.edu",
      role: "scholar",
      department: "Electronics",
      status: "Active",
    },
    {
      name: "Michael Brown",
      email: "michael.brown@univ.edu",
      role: "scholar",
      department: "Information Tech",
      status: "Inactive",
    },
    {
      name: "Riya Sharma",
      email: "riya.sharma@college.edu",
      role: "scholar",
      department: "MCA",
      status: "Active",
    },
    {
      name: "Aman Verma",
      email: "aman.verma@college.edu",
      role: "scholar",
      department: "MCA",
      status: "Active",
    },
    {
      name: "Neha Gupta",
      email: "neha.gupta@college.edu",
      role: "scholar",
      department: "MCA",
      status: "Active",
    },
    {
      name: "Pooja Singh",
      email: "pooja.singh@college.edu",
      role: "scholar",
      department: "MCA",
      status: "Active",
    },
  ]);

  const admin = users.find((user) => user.role === "admin");
  const coordinator = users.find((user) => user.role === "coordinator");
  const faculty = users.find((user) => user.role === "faculty");
  const johnSmith = users.find((user) => user.email === "john.smith@univ.edu");
  const sarahWilson = users.find((user) => user.email === "sarah.wilson@univ.edu");
  const michaelBrown = users.find((user) => user.email === "michael.brown@univ.edu");
  const riyaSharma = users.find((user) => user.email === "riya.sharma@college.edu");

  await Department.insertMany([
    {
      name: "Computer Science",
      email: "cs@univ.edu",
      coordinator: admin._id,
      totalScholars: 12,
    },
    {
      name: "Information Technology",
      email: "it@univ.edu",
      coordinator: admin._id,
      totalScholars: 8,
    },
    {
      name: "Electronics",
      email: "ece@univ.edu",
      coordinator: admin._id,
      totalScholars: 6,
    },
    {
      name: "MCA - Master of Computer Applications",
      email: "mca@college.edu",
      coordinator: coordinator._id,
      totalScholars: 28,
    },
    {
      name: "BCA - Bachelor of Computer Applications",
      email: "bca@college.edu",
      coordinator: admin._id,
      totalScholars: 24,
    },
  ]);

  await Submission.insertMany([
    {
      title: "AI in Healthcare",
      abstract: "Explores AI applications for diagnostics and patient monitoring.",
      department: "Computer Science",
      scholar: johnSmith._id,
      supervisor: faculty._id,
      status: "Pending",
      submittedAt: new Date("2024-05-15"),
    },
    {
      title: "Blockchain for Security",
      abstract: "Evaluates blockchain models for secure data sharing.",
      department: "Information Tech",
      scholar: michaelBrown._id,
      supervisor: faculty._id,
      status: "Pending",
      submittedAt: new Date("2024-05-14"),
    },
    {
      title: "Smart Cities and IoT",
      abstract: "IoT-driven frameworks for smart city services.",
      department: "Electronics",
      scholar: sarahWilson._id,
      supervisor: faculty._id,
      status: "Approved",
      submittedAt: new Date("2024-05-10"),
      reviewedAt: new Date("2024-05-12"),
      reviewer: admin._id,
    },
    {
      title: "Cloud Computing Benefits",
      abstract: "Analysis of cloud computing adoption benefits.",
      department: "Computer Science",
      scholar: johnSmith._id,
      supervisor: faculty._id,
      status: "Rejected",
      submittedAt: new Date("2024-05-08"),
      reviewedAt: new Date("2024-05-09"),
      reviewer: admin._id,
    },
    {
      title: "AI in Healthcare",
      abstract: "MCA submission on healthcare automation.",
      department: "MCA",
      scholar: riyaSharma._id,
      status: "Pending",
      submittedAt: new Date("2024-05-15"),
    },
  ]);

  await SystemSettings.create({
    systemName: "Research System",
    organization: "Example University",
    timezone: "GMT+05:30",
    dateFormat: "dd/mm/yyyy",
  });

  console.log("Seed complete.");
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
