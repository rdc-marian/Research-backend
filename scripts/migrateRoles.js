require("dotenv").config();
const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const bcrypt = require("bcrypt");

const run = async () => {
  await connectDB();
  console.log("Starting migration...");

  const users = await User.find();
  const defaultPasswordStr = "Password@123";
  const defaultPasswordHash = await bcrypt.hash(defaultPasswordStr, 10);
  let passwordUpdated = 0;
  let roleUpdated = 0;

  for (const user of users) {
    let changed = false;
    
    // Set default password if missing
    if (!user.password) {
      user.password = defaultPasswordHash;
      changed = true;
      passwordUpdated++;
    }

    // Check if role or roles have the legacy combined string
    const legacyRoleStr = "Faculty Member / Research Guide";
    
    // According to mongoose enum, it should be either 'faculty' or 'research_guide', 
    // but in case data was saved differently or if we need to migrate based on 'guide' usage:
    // If the user's string representations have legacyRoleStr or if they have both 'faculty' and 'research_guide'
    // Let's ensure strict separation. The prompt says separate into faculty and research_guide.
    // If they have scholars assigned, they should be research_guide, else faculty.

    if (user.role === legacyRoleStr || (user.roles && user.roles.includes(legacyRoleStr))) {
      // Find if they have scholars
      const hasScholars = await User.exists({ guide: user._id, roles: "scholar" });
      const newRole = hasScholars ? "research_guide" : "faculty";
      
      user.role = newRole;
      user.roles = [newRole];
      changed = true;
      roleUpdated++;
    }

    if (changed) {
      // Temporarily disable validation for role in case of any issues with enums
      await user.save({ validateBeforeSave: false });
    }
  }

  console.log("Migration complete.");
  console.log(`Assigned default password '${defaultPasswordStr}' to ${passwordUpdated} users.`);
  console.log(`Updated legacy roles for ${roleUpdated} users.`);

  process.exit(0);
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
