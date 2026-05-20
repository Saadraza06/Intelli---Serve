const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Convert Light to Dark Theme (Cyan, Dark Slate, Purple, Black)
  content = content.replace(/bg-white\/80/g, 'bg-black/80');
  content = content.replace(/bg-white/g, 'bg-slate-900');
  content = content.replace(/bg-zinc-50/g, 'bg-black');
  content = content.replace(/bg-zinc-100/g, 'bg-slate-800');
  
  content = content.replace(/text-zinc-900/g, 'text-white');
  content = content.replace(/text-zinc-800/g, 'text-slate-200');
  content = content.replace(/text-zinc-600/g, 'text-slate-300');
  content = content.replace(/text-zinc-500/g, 'text-slate-400');
  content = content.replace(/text-zinc-400/g, 'text-slate-500');
  
  content = content.replace(/border-zinc-300/g, 'border-slate-700');
  content = content.replace(/border-zinc-200/g, 'border-slate-800');
  content = content.replace(/border-zinc-100/g, 'border-slate-800/50');
  
  // Specific tweaks for Cyan and Purple accents
  content = content.replace(/bg-emerald-500/g, 'bg-cyan-500');
  content = content.replace(/bg-emerald-50/g, 'bg-purple-900/30');
  content = content.replace(/text-emerald-700/g, 'text-cyan-400');
  content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-purple-900/50');
  
  // Update shadows for vibrant cyan and purple glow
  content = content.replace(/shadow-sm/g, 'shadow-[0_0_15px_rgba(6,182,212,0.15)]');
  content = content.replace(/shadow-md/g, 'shadow-[0_0_20px_rgba(147,51,234,0.2)]');

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

console.log("Theme updated to Cyan, Dark Slate, Purple, Black successfully!");
