const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Specific tweaks
  content = content.replace(/bg-pink-500/g, 'bg-cyan-500');
  content = content.replace(/bg-purple-900\/30/g, 'bg-blue-950/80');
  content = content.replace(/text-purple-400/g, 'text-cyan-400');
  content = content.replace(/hover:bg-purple-900\/50/g, 'hover:bg-blue-900/50');
  
  // Update shadows to blue
  content = content.replace(/shadow-\[0_0_15px_rgba\(168,85,247,0\.1\)\]/g, 'shadow-[0_0_15px_rgba(0,240,255,0.15)]');
  content = content.replace(/shadow-\[0_0_20px_rgba\(236,72,153,0\.15\)\]/g, 'shadow-[0_0_20px_rgba(0,240,255,0.2)]');

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

console.log("Theme updated to Electric Blue, Dark Navy, Black successfully!");
