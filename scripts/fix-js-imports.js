const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, files);
    } else {
      files.push(filePath);
    }
  }
  return files;
}

const replacements = [
  // Mongoose cleanups
  [/\bconst\s+mongoose_1\s*=\s*require\("mongoose"\);/g, 'const mongoose = require("mongoose");'],
  [/\bconst\s+mongoose_1\s*=\s*__importDefault\(require\("mongoose"\)\);/g, 'const mongoose = require("mongoose");'],
  [/\bconst\s+mongoose_2\s*=\s*require\("mongoose"\);/g, 'const mongoose = require("mongoose");'],
  [/\bconst\s+mongoose_2\s*=\s*__importDefault\(require\("mongoose"\)\);/g, 'const mongoose = require("mongoose");'],
  [/mongoose_1\.default/g, 'mongoose'],
  [/mongoose_2\.default/g, 'mongoose'],

  // Express cleanups
  [/\bconst\s+express_1\s*=\s*require\("express"\);/g, 'const express = require("express");'],
  [/\bconst\s+express_1\s*=\s*__importDefault\(require\("express"\)\);/g, 'const express = require("express");'],
  [/\bconst\s+express_2\s*=\s*require\("express"\);/g, 'const express = require("express");'],
  [/\bconst\s+express_2\s*=\s*__importDefault\(require\("express"\)\);/g, 'const express = require("express");'],
  [/express_1\.default/g, 'express'],
  [/express_2\.default/g, 'express'],

  // Cors cleanups
  [/\bconst\s+cors_1\s*=\s*require\("cors"\);/g, 'const cors = require("cors");'],
  [/\bconst\s+cors_1\s*=\s*__importDefault\(require\("cors"\)\);/g, 'const cors = require("cors");'],
  [/cors_1\.default/g, 'cors'],

  // Morgan cleanups
  [/\bconst\s+morgan_1\s*=\s*require\("morgan"\);/g, 'const morgan = require("morgan");'],
  [/\bconst\s+morgan_1\s*=\s*__importDefault\(require\("morgan"\)\);/g, 'const morgan = require("morgan");'],
  [/morgan_1\.default/g, 'morgan'],

  // CookieParser cleanups
  [/\bconst\s+cookie_parser_1\s*=\s*require\("cookie-parser"\);/g, 'const cookieParser = require("cookie-parser");'],
  [/\bconst\s+cookie_parser_1\s*=\s*__importDefault\(require\("cookie-parser"\)\);/g, 'const cookieParser = require("cookie-parser");'],
  [/cookie_parser_1\.default/g, 'cookieParser'],

  // Multer cleanups
  [/\bconst\s+multer_1\s*=\s*require\("multer"\);/g, 'const multer = require("multer");'],
  [/\bconst\s+multer_1\s*=\s*__importDefault\(require\("multer"\)\);/g, 'const multer = require("multer");'],
  [/multer_1\.default/g, 'multer'],

  // Bcrypt cleanups
  [/\bconst\s+bcrypt_1\s*=\s*require\("bcrypt"\);/g, 'const bcrypt = require("bcrypt");'],
  [/\bconst\s+bcrypt_1\s*=\s*__importDefault\(require\("bcrypt"\)\);/g, 'const bcrypt = require("bcrypt");'],
  [/bcrypt_1\.default/g, 'bcrypt'],

  // JWT cleanups
  [/\bconst\s+jsonwebtoken_1\s*=\s*require\("jsonwebtoken"\);/g, 'const jwt = require("jsonwebtoken");'],
  [/\bconst\s+jsonwebtoken_1\s*=\s*__importDefault\(require\("jsonwebtoken"\)\);/g, 'const jwt = require("jsonwebtoken");'],
  [/jsonwebtoken_1\.default/g, 'jwt'],

  // Models cleanups
  [/\bconst\s+User_1\s*=\s*require\("\.\.\/models\/User"\);/g, 'const User = require("../models/User");'],
  [/\bconst\s+User_1\s*=\s*__importDefault\(require\("\.\.\/models\/User"\)\);/g, 'const User = require("../models/User");'],
  [/User_1\.default/g, 'User'],

  [/\bconst\s+Department_1\s*=\s*require\("\.\.\/models\/Department"\);/g, 'const Department = require("../models/Department");'],
  [/\bconst\s+Department_1\s*=\s*__importDefault\(require\("\.\.\/models\/Department"\)\);/g, 'const Department = require("../models/Department");'],
  [/Department_1\.default/g, 'Department'],

  [/\bconst\s+ResearchCenter_1\s*=\s*require\("\.\.\/models\/ResearchCenter"\);/g, 'const ResearchCenter = require("../models/ResearchCenter");'],
  [/\bconst\s+ResearchCenter_1\s*=\s*__importDefault\(require\("\.\.\/models\/ResearchCenter"\)\);/g, 'const ResearchCenter = require("../models/ResearchCenter");'],
  [/ResearchCenter_1\.default/g, 'ResearchCenter'],

  [/\bconst\s+Submission_1\s*=\s*require\("\.\.\/models\/Submission"\);/g, 'const Submission = require("../models/Submission");'],
  [/\bconst\s+Submission_1\s*=\s*__importDefault\(require\("\.\.\/models\/Submission"\)\);/g, 'const Submission = require("../models/Submission");'],
  [/Submission_1\.default/g, 'Submission'],

  [/\bconst\s+LeaveApplication_1\s*=\s*require\("\.\.\/models\/LeaveApplication"\);/g, 'const LeaveApplication = require("../models/LeaveApplication");'],
  [/\bconst\s+LeaveApplication_1\s*=\s*__importDefault\(require\("\.\.\/models\/LeaveApplication"\)\);/g, 'const LeaveApplication = require("../models/LeaveApplication");'],
  [/LeaveApplication_1\.default/g, 'LeaveApplication'],

  [/\bconst\s+Incentive_1\s*=\s*require\("\.\.\/models\/Incentive"\);/g, 'const Incentive = require("../models/Incentive");'],
  [/\bconst\s+Incentive_1\s*=\s*__importDefault\(require\("\.\.\/models\/Incentive"\)\);/g, 'const Incentive = require("../models/Incentive");'],
  [/Incentive_1\.default/g, 'Incentive'],

  [/\bconst\s+SystemSettings_1\s*=\s*require\("\.\.\/models\/SystemSettings"\);/g, 'const SystemSettings = require("../models/SystemSettings");'],
  [/\bconst\s+SystemSettings_1\s*=\s*__importDefault\(require\("\.\.\/models\/SystemSettings"\)\);/g, 'const SystemSettings = require("../models/SystemSettings");'],
  [/SystemSettings_1\.default/g, 'SystemSettings'],

  // Roles cleanups
  [/\bconst\s+roles_1\s*=\s*require\("\.\.\/utils\/roles"\);/g, 'const { normalizeRoles } = require("../utils/roles");'],
  [/\bconst\s+roles_1\s*=\s*require\("\.\/roles"\);/g, 'const { normalizeRoles } = require("./roles");'],
  [/roles_1\.normalizeRoles/g, 'normalizeRoles'],

  // Path cleanups
  [/\bconst\s+path_1\s*=\s*require\("path"\);/g, 'const path = require("path");'],
  [/\bconst\s+path_1\s*=\s*__importDefault\(require\("path"\)\);/g, 'const path = require("path");'],
  [/path_1\.default/g, 'path'],

  // Fs cleanups
  [/\bconst\s+fs_1\s*=\s*require\("fs"\);/g, 'const fs = require("fs");'],
  [/\bconst\s+fs_1\s*=\s*__importDefault\(require\("fs"\)\);/g, 'const fs = require("fs");'],
  [/fs_1\.default/g, 'fs'],

  // Default imports helper cleanup
  [/var\s+__importDefault\s*=\s*\(this\s*&&\s*this\.__importDefault\)\s*\|\|\s*function\s*\(mod\)\s*\{\s*return\s*\(mod\s*&&\s*mod\.__esModule\)\s*\?\s*mod\s*:\s*\{\s*"default":\s*mod\s*\};\s*\};/g, ''],
];

function fix() {
  const files = getFiles(srcDir).filter(f => f.endsWith(".js"));
  console.log(`Fixing transpilation patterns in ${files.length} JavaScript files...`);

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    let original = content;

    for (const [regex, replacement] of replacements) {
      content = content.replace(regex, replacement);
    }

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      console.log(`Fixed: ${path.relative(srcDir, file)}`);
    }
  }
  console.log("Fixing completed successfully.");
}

fix();
