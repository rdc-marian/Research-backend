const fs = require('fs');
const path = require('path');

function processControllersAndMiddleware() {
  const dirs = ['src/controllers', 'src/middleware', 'src/routes', 'src/utils'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('import type { Request')) {
        content = 'import type { Request, Response, NextFunction } from "express";\n' + content;
      }
      
      content = content.replace(/async \(req, res, next\)/g, 'async (req: Request, res: Response, next: NextFunction)');
      content = content.replace(/async \(req, res\)/g, 'async (req: Request, res: Response)');
      content = content.replace(/\(req, res, next\) =>/g, '(req: Request, res: Response, next: NextFunction) =>');
      content = content.replace(/\(req, res\) =>/g, '(req: Request, res: Response) =>');
      content = content.replace(/function ([a-zA-Z0-9_]+)\(req, res, next\)/g, 'function $1(req: Request, res: Response, next: NextFunction)');
      content = content.replace(/function ([a-zA-Z0-9_]+)\(req, res\)/g, 'function $1(req: Request, res: Response)');
      
      // Additional fixes for middleware
      if (dir === 'src/middleware' || dir === 'src/utils') {
        content = content.replace(/\(err, req, res, next\)/g, '(err: any, req: Request, res: Response, next: NextFunction)');
      }
      
      fs.writeFileSync(filePath, content);
    }
  }
}

function processModels() {
  const dir = 'src/models';
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const modelNameMatch = content.match(/mongoose\.model\("([^"]+)"/);
    if (modelNameMatch) {
      const modelName = modelNameMatch[1];
      
      if (!content.includes(`interface I${modelName}`)) {
        const interfaceCode = `\nexport interface I${modelName} extends mongoose.Document {\n  [key: string]: any;\n}\n\n`;
        
        content = content.replace(/const mongoose = require\("mongoose"\);/, `import mongoose from "mongoose";\n${interfaceCode}`);
        content = content.replace(/new mongoose\.Schema\(/, `new mongoose.Schema<I${modelName}>(`);
        content = content.replace(/mongoose\.model\("([^"]+)",\s*([a-zA-Z0-9_]+)\)/, `mongoose.model<I${modelName}>("$1", $2)`);
      }
    }
    
    fs.writeFileSync(filePath, content);
  }
}

processControllersAndMiddleware();
processModels();
console.log("Migration script complete");
