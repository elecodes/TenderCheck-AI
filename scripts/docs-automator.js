const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '../README.md');
const ADR_DIR = path.join(__dirname, '../docs/adr');
const ADR_README_PATH = path.join(__dirname, '../docs/adr/README.md');

// 1. Generate Project Tree for README
function generateTree(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  let output = '';
  
  // Filter ignored folders
  const filtered = files.filter(f => !f.startsWith('.') && f !== 'node_modules' && f !== 'dist' && f !== 'coverage');

  filtered.forEach((file, index) => {
    const isLast = index === filtered.length - 1;
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    output += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
    
    if (stats.isDirectory()) {
      output += generateTree(filePath, prefix + (isLast ? '    ' : '│   '));
    }
  });
  
  return output;
}

function updateReadmeTree() {
  if (!fs.existsSync(README_PATH)) return;
  
  let content = fs.readFileSync(README_PATH, 'utf8');
  const tree = generateTree(path.join(__dirname, '../'));
  
  const startMarker = '<!-- TREE_START -->';
  const endMarker = '<!-- TREE_END -->';
  
  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const newContent = `${startMarker}\n\`\`\`text\n${tree}\`\`\`\n${endMarker}`;
  
  if (content.match(regex)) {
    fs.writeFileSync(README_PATH, content.replace(regex, newContent));
    console.log('✅ README Project Tree updated');
  } else {
    console.warn('⚠️ No TREE markers found in README.md');
  }
}

// 2. Generate ADR Index
function updateAdrIndex() {
  if (!fs.existsSync(ADR_DIR)) return;
  
  const files = fs.readdirSync(ADR_DIR).filter(f => f.endsWith('.md') && f !== 'README.md');
  let indexContent = '# 🧠 Architecture Decision Records (ADR)\n\n| ID | Title | Status |\n|---|---|---|\n'; // Header
  
  files.forEach(file => {
      const content = fs.readFileSync(path.join(ADR_DIR, file), 'utf8');
      const titleMatch = content.match(/^#\s+(.*)/m);
      const statusMatch = content.match(/\*\s*Status:\s*(.*)/i);
      
      const title = titleMatch ? titleMatch[1] : file;
      const status = statusMatch ? statusMatch[1] : 'Unknown';
      const link = `./${file}`;
      
      indexContent += `| ${file.split('-')[0]} | [${title}](${link}) | ${status} |\n`;
  });
  
  fs.writeFileSync(ADR_README_PATH, indexContent);
  console.log('✅ ADR Index generated');
}

// 3. Generate Playbook Scripts Table
function updatePlaybookScripts() {
  const PLAYBOOK_PATH = path.join(__dirname, '../docs/PLAYBOOK.md');
  const BACKEND_PKG = path.join(__dirname, '../backend/package.json');
  const FRONTEND_PKG = path.join(__dirname, '../frontend/package.json');

  if (!fs.existsSync(PLAYBOOK_PATH)) return;

  let tableContent = '| Scope | Command | Description |\n|---|---|---|\n';

  const addScripts = (pkgPath, scope) => {
    if (fs.existsSync(pkgPath)) {
      const pkg = require(pkgPath);
      Object.entries(pkg.scripts || {}).forEach(([cmd, run]) => {
         // Filter out internal scripts if needed, or keeping all
         tableContent += `| **${scope}** | \`npm run ${cmd}\` | \`${run}\` |\n`;
      });
    }
  };

  addScripts(BACKEND_PKG, 'Backend');
  addScripts(FRONTEND_PKG, 'Frontend');

  const startMarker = '<!-- SCRIPTS_START -->';
  const endMarker = '<!-- SCRIPTS_END -->';
  
  let content = fs.readFileSync(PLAYBOOK_PATH, 'utf8');
  const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const newContent = `${startMarker}\n${tableContent}\n${endMarker}`;
  
  if (content.match(regex)) {
    fs.writeFileSync(PLAYBOOK_PATH, content.replace(regex, newContent));
    console.log('✅ Playbook Scripts updated');
  } else {
    console.warn('⚠️ No SCRIPTS markers found in PLAYBOOK.md');
  }
}

// Run
console.log('🔄 Running Documentation Automator...');
updateReadmeTree();
updateAdrIndex();
updatePlaybookScripts();
