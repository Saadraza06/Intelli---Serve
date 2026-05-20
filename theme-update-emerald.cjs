const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Revert Backgrounds to White/Light Charcoal
  content = content.replace(/bg-black\/80/g, 'bg-white/80');
  content = content.replace(/bg-slate-900\/50/g, 'bg-zinc-50');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-black/g, 'bg-zinc-50');
  content = content.replace(/bg-slate-800/g, 'bg-zinc-100');
  
  // Revert Text to Charcoal
  content = content.replace(/text-white/g, 'text-zinc-900');
  content = content.replace(/text-slate-200/g, 'text-zinc-800');
  content = content.replace(/text-slate-300/g, 'text-zinc-600');
  content = content.replace(/text-slate-400/g, 'text-zinc-500');
  content = content.replace(/text-slate-500/g, 'text-zinc-400');
  
  // Revert Borders
  content = content.replace(/border-slate-700/g, 'border-zinc-300');
  content = content.replace(/border-slate-800\/50/g, 'border-zinc-100');
  content = content.replace(/border-slate-800/g, 'border-zinc-200');
  
  // Specific tweaks to Emerald Green
  content = content.replace(/bg-cyan-500/g, 'bg-emerald-500');
  content = content.replace(/bg-blue-950\/80/g, 'bg-emerald-50');
  content = content.replace(/text-cyan-400/g, 'text-emerald-700');
  content = content.replace(/hover:bg-blue-900\/50/g, 'hover:bg-emerald-100');
  
  // Update shadows back to normal
  content = content.replace(/shadow-\[0_0_15px_rgba\(0,240,255,0\.15\)\]/g, 'shadow-sm');
  content = content.replace(/shadow-\[0_0_20px_rgba\(0,240,255,0\.2\)\]/g, 'shadow-md');

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

console.log("Theme updated to Emerald Green, Charcoal, White successfully!");
