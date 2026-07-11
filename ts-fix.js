const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/const query = \{\};/g, 'const query: any = {};');
      content = content.replace(/const updates = \{\};/g, 'const updates: any = {};');
      content = content.replace(/let updates = \{\};/g, 'let updates: any = {};');
      content = content.replace(/const scholarQuery = \{/g, 'const scholarQuery: any = {');
      content = content.replace(/const scholarQuery: any = \{\s*\$or/g, 'const scholarQuery: any = { $or');
      
      // Fix roles.ts
      if (file === 'roles.ts') {
        content = content.replace(/const normalizeRoles = \(\{ role, roles \} = \{\}\) => \{/g, 'const normalizeRoles = ({ role, roles }: any = {}) => {');
      }
      
      // Fix portfolioController date error
      if (file === 'portfolioController.ts') {
        content = content.replace(/allApprovals\.sort\(\(a, b\) => new Date\(b\.createdAt\) - new Date\(a\.createdAt\)\);/g, 'allApprovals.sort((a: any, b: any) => (new Date(b.createdAt) as any) - (new Date(a.createdAt) as any));');
      }
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src');
console.log('Done');
