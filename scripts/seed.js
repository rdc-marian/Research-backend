require("dotenv").config();
const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Department = require("../src/models/Department");
const ResearchCenter = require("../src/models/ResearchCenter");
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
      ResearchCenter.deleteMany(),
      Submission.deleteMany(),
      SystemSettings.deleteMany(),
    ]);
  }

  const admin = await User.create({
    name: "Admin User",
    email: "admin@univ.edu",
    role: "admin",
    roles: ["admin"],
    department: "Administration",
    status: "Active",
  });

  const coordinator = await User.create({
    name: "Dr. Priya Sharma",
    email: "priya.sharma@college.edu",
    role: "coordinator",
    roles: ["coordinator", "faculty"],
    department: "MCA - Master of Computer Applications",
    phone: "9876543210",
    status: "Active",
  });

  const departments = await Department.insertMany([
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

  const csDept = departments.find((dept) => dept.name === "Computer Science");
  const itDept = departments.find((dept) => dept.name === "Information Technology");
  const eceDept = departments.find((dept) => dept.name === "Electronics");
  const mcaDept = departments.find(
    (dept) => dept.name === "MCA - Master of Computer Applications"
  );
  const bcaDept = departments.find(
    (dept) => dept.name === "BCA - Bachelor of Computer Applications"
  );

  const researchCenters = await ResearchCenter.insertMany([
    {
      name: "Computer Science Research Center",
      code: "CSRC",
      coordinator: admin._id,
      department: csDept?._id,
      status: "Active",
    },
    {
      name: "Information Technology Research Center",
      code: "ITRC",
      coordinator: admin._id,
      department: itDept?._id,
      status: "Active",
    },
    {
      name: "Electronics Research Center",
      code: "ECRC",
      coordinator: admin._id,
      department: eceDept?._id,
      status: "Active",
    },
    {
      name: "MCA Research Center",
      code: "MCARC",
      coordinator: coordinator._id,
      department: mcaDept?._id,
      status: "Active",
    },
    {
      name: "BCA Research Center",
      code: "BCARC",
      coordinator: admin._id,
      department: bcaDept?._id,
      status: "Active",
    },
  ]);

  const csCenter = researchCenters.find((center) => center.code === "CSRC");
  const itCenter = researchCenters.find((center) => center.code === "ITRC");
  const eceCenter = researchCenters.find((center) => center.code === "ECRC");
  const mcaCenter = researchCenters.find((center) => center.code === "MCARC");
  const bcaCenter = researchCenters.find((center) => center.code === "BCARC");

  const facultyGuide = await User.create({
    name: "Dr. Emily Davis",
    email: "emily.davis@univ.edu",
    role: "faculty",
    roles: ["faculty", "research_guide"],
    department: "Computer Science",
    status: "Active",
    researchCenter: csCenter?._id,
  });

  const itGuide = await User.create({
    name: "Dr. Kiran Nair",
    email: "kiran.nair@univ.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    department: "Information Technology",
    status: "Active",
    researchCenter: itCenter?._id,
  });

  const eceGuide = await User.create({
    name: "Dr. Anita George",
    email: "anita.george@univ.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    department: "Electronics",
    status: "Active",
    researchCenter: eceCenter?._id,
  });

  const mcaGuide = await User.create({
    name: "Dr. Rakesh Patel",
    email: "rakesh.patel@college.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    department: "MCA - Master of Computer Applications",
    status: "Active",
    researchCenter: mcaCenter?._id,
  });

  const bcaGuide = await User.create({
    name: "Dr. Meera Kapoor",
    email: "meera.kapoor@college.edu",
    role: "research_guide",
    roles: ["research_guide", "faculty"],
    department: "BCA - Bachelor of Computer Applications",
    status: "Active",
    researchCenter: bcaCenter?._id,
  });

  const scholars = await User.insertMany([
    {
      name: "John Smith",
      email: "john.smith@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "Computer Science",
      status: "Active",
      researchCenter: csCenter?._id,
      guide: facultyGuide._id,
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "Electronics",
      status: "Active",
      researchCenter: eceCenter?._id,
      guide: eceGuide._id,
    },
    {
      name: "Michael Brown",
      email: "michael.brown@univ.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "Information Tech",
      status: "Inactive",
      researchCenter: itCenter?._id,
      guide: itGuide._id,
    },
    {
      name: "Riya Sharma",
      email: "riya.sharma@college.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      researchCenter: mcaCenter?._id,
      guide: mcaGuide._id,
    },
    {
      name: "Aman Verma",
      email: "aman.verma@college.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      researchCenter: mcaCenter?._id,
      guide: mcaGuide._id,
    },
    {
      name: "Neha Gupta",
      email: "neha.gupta@college.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      researchCenter: mcaCenter?._id,
      guide: mcaGuide._id,
    },
    {
      name: "Pooja Singh",
      email: "pooja.singh@college.edu",
      role: "scholar",
      roles: ["scholar"],
      department: "MCA",
      status: "Active",
      researchCenter: mcaCenter?._id,
      guide: mcaGuide._id,
    },
  ]);

  const johnSmith = scholars.find((user) => user.email === "john.smith@univ.edu");
  const sarahWilson = scholars.find((user) => user.email === "sarah.wilson@univ.edu");
  const michaelBrown = scholars.find(
    (user) => user.email === "michael.brown@univ.edu"
  );
  const riyaSharma = scholars.find((user) => user.email === "riya.sharma@college.edu");

  await Submission.insertMany([
    {
      title: "AI in Healthcare",
      abstract: "Explores AI applications for diagnostics and patient monitoring.",
      department: "Computer Science",
      scholar: johnSmith._id,
      supervisor: facultyGuide._id,
      status: "Pending",
      submittedAt: new Date("2024-05-15"),
    },
    {
      title: "Blockchain for Security",
      abstract: "Evaluates blockchain models for secure data sharing.",
      department: "Information Tech",
      scholar: michaelBrown._id,
      supervisor: itGuide._id,
      status: "Pending",
      submittedAt: new Date("2024-05-14"),
    },
    {
      title: "Smart Cities and IoT",
      abstract: "IoT-driven frameworks for smart city services.",
      department: "Electronics",
      scholar: sarahWilson._id,
      supervisor: eceGuide._id,
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
      supervisor: facultyGuide._id,
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
