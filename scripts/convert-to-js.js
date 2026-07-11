const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const srcDir = path.join(__dirname, "..", "src");

// Recursively get all files in a directory
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

function convert() {
  const files = getFiles(srcDir);
  const tsFiles = files.filter(f => f.endsWith(".ts") && !f.endsWith(".d.ts"));

  console.log(`Found ${tsFiles.length} TypeScript files to convert.`);

  for (const file of tsFiles) {
    const relativePath = path.relative(srcDir, file);
    console.log(`Converting: ${relativePath}`);

    const code = fs.readFileSync(file, "utf8");

    // Transpile TS code to JS
    const result = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        removeComments: false,
      }
    });

    let jsCode = result.outputText;

    // Clean up any extra artifacts if tsc generated them
    // E.g. exports.__esModule = true;
    jsCode = jsCode.replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);/g, "");

    const jsFile = file.slice(0, -3) + ".js";
    fs.writeFileSync(jsFile, jsCode, "utf8");

    // Delete original TS file
    fs.unlinkSync(file);
  }

  // Delete src/types directory if it exists
  const typesDir = path.join(srcDir, "types");
  if (fs.existsSync(typesDir)) {
    fs.rmSync(typesDir, { recursive: true, force: true });
    console.log("Deleted src/types directory.");
  }

  console.log("Conversion completed successfully.");
}

convert();
