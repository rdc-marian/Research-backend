require("dotenv").config();
const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const ResearchCenter = require("../src/models/ResearchCenter");
const Submission = require("../src/models/Submission");

const run = async () => {
  await connectDB();

  const rolesFromRole = await User.updateMany(
    {
      $and: [
        { $or: [{ roles: { $exists: false } }, { roles: { $size: 0 } }] },
        { role: { $exists: true, $ne: null } },
      ],
    },
    [
      {
        $set: {
          roles: ["$role"],
        },
      },
    ]
  );

  const roleFromRoles = await User.updateMany(
    {
      $and: [
        { $or: [{ role: { $exists: false } }, { role: null }] },
        { roles: { $exists: true, $ne: [] } },
      ],
    },
    [
      {
        $set: {
          role: { $arrayElemAt: ["$roles", 0] },
        },
      },
    ]
  );

  const submissionsUpdated = await Submission.updateMany(
    { submittedAt: { $exists: false } },
    [
      {
        $set: {
          submittedAt: "$createdAt",
        },
      },
    ]
  );

  console.log("Migration complete.");
  console.log("Updated users with roles:", rolesFromRole.modifiedCount);
  console.log("Updated users with role:", roleFromRoles.modifiedCount);
  console.log("Updated submissions:", submissionsUpdated.modifiedCount);

  process.exit(0);
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
