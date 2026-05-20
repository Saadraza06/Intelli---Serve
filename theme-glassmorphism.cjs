const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Strip out old complex responsive classes and replace with pure Glassmorphism
  
  // Backgrounds (Main containers)
  content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-transparent');
  content = content.replace(/bg-zinc-50 dark:bg-black/g, 'bg-transparent');
  content = content.replace(/bg-white dark:bg-slate-800/g, 'bg-transparent');
  
  // Backgrounds (Cards & Inputs)
  content = content.replace(/bg-zinc-50 dark:bg-slate-800/g, 'bg-white/5 backdrop-blur-md');
  content = content.replace(/bg-zinc-100 dark:bg-slate-800/g, 'bg-white/10 backdrop-blur-lg');
  content = content.replace(/bg-white\/80 dark:bg-slate-900\/80/g, 'bg-black/40 backdrop-blur-xl');
  content = content.replace(/bg-white\/90 dark:bg-slate-900\/90/g, 'bg-black/60 backdrop-blur-2xl');
  
  // Text
  content = content.replace(/text-zinc-900 dark:text-white/g, 'text-white');
  content = content.replace(/text-zinc-800 dark:text-slate-200/g, 'text-slate-100');
  content = content.replace(/text-zinc-600 dark:text-slate-300/g, 'text-slate-300');
  content = content.replace(/text-zinc-500 dark:text-slate-400/g, 'text-slate-400');
  content = content.replace(/text-zinc-400 dark:text-slate-500/g, 'text-slate-500');
  
  // Borders
  content = content.replace(/border-zinc-300 dark:border-slate-700/g, 'border-white/20');
  content = content.replace(/border-zinc-200 dark:border-slate-800/g, 'border-white/10');
  content = content.replace(/border-zinc-100 dark:border-slate-800\/50/g, 'border-white/5');
  
  // Accents & Gradients
  content = content.replace(/bg-emerald-500 dark:bg-blue-500/g, 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-white/20');
  content = content.replace(/bg-blue-500 dark:bg-blue-600/g, 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]');
  content = content.replace(/text-emerald-700 dark:text-cyan-400/g, 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]');
  content = content.replace(/bg-emerald-50 dark:bg-cyan-900\/30/g, 'bg-cyan-500/10 border border-cyan-500/30');
  content = content.replace(/hover:bg-emerald-100 dark:hover:bg-cyan-900\/50/g, 'hover:bg-white/10');
  
  // Extra specific replacements for missed utility combos
  content = content.replace(/bg-slate-50 dark:bg-slate-800/g, 'bg-white/5 backdrop-blur-md');
  content = content.replace(/bg-gray-50 dark:bg-slate-800/g, 'bg-white/5 backdrop-blur-md');
  content = content.replace(/border-gray-200 dark:border-slate-800/g, 'border-white/10');
  content = content.replace(/text-gray-900 dark:text-white/g, 'text-white');
  content = content.replace(/text-gray-500 dark:text-slate-400/g, 'text-slate-400');
  content = content.replace(/text-gray-600 dark:text-slate-300/g, 'text-slate-300');

  // Shadows
  content = content.replace(/shadow-sm/g, 'shadow-[0_4px_30px_rgba(0,0,0,0.1)]');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

const dirs = [
  path.join(__dirname, 'src', 'screens')
];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      replaceInFile(path.join(dir, file));
    }
  });
});

console.log("Glassmorphism refactoring complete!");
