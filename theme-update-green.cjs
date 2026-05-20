const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Specific tweaks to change Cyan to Dark Green
  content = content.replace(/bg-cyan-500/g, 'bg-green-700');
  content = content.replace(/text-cyan-400/g, 'text-green-500');
  
  // Update shadows for dark green glow
  content = content.replace(/shadow-\[0_0_15px_rgba\(6,182,212,0\.15\)\]/g, 'shadow-[0_0_15px_rgba(21,128,61,0.3)]');

  fs.writeFileSync(filePath, content, 'utf8');
}

const dirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'src/screens')
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      replaceInFile(path.join(dir, file));
    }
  });
});

console.log("Theme updated to Dark Green, Dark Slate, Purple, Black successfully!");
