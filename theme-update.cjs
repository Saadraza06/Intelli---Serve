const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backgrounds
  content = content.replace(/bg-white\/80/g, 'bg-black/80');
  content = content.replace(/bg-white/g, 'bg-slate-900');
  content = content.replace(/bg-gray-50/g, 'bg-black');
  content = content.replace(/bg-slate-50/g, 'bg-slate-900/50');
  content = content.replace(/bg-gray-100/g, 'bg-slate-800');
  
  // Text
  content = content.replace(/text-gray-900/g, 'text-white');
  content = content.replace(/text-gray-800/g, 'text-slate-200');
  content = content.replace(/text-slate-800/g, 'text-slate-200');
  content = content.replace(/text-gray-700/g, 'text-slate-300');
  content = content.replace(/text-gray-600/g, 'text-slate-300');
  content = content.replace(/text-gray-500/g, 'text-slate-400');
  content = content.replace(/text-slate-500/g, 'text-slate-400');
  content = content.replace(/text-gray-400/g, 'text-slate-500');
  
  // Borders
  content = content.replace(/border-gray-300/g, 'border-slate-700');
  content = content.replace(/border-gray-200/g, 'border-slate-800');
  content = content.replace(/border-slate-200/g, 'border-slate-800');
  content = content.replace(/border-gray-100/g, 'border-slate-800/50');
  
  // Specific tweaks
  content = content.replace(/bg-primary-light/g, 'bg-pink-500');
  content = content.replace(/bg-indigo-50/g, 'bg-purple-900/30');
  content = content.replace(/text-indigo-700/g, 'text-purple-400');
  content = content.replace(/hover:bg-indigo-100/g, 'hover:bg-purple-900/50');

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

console.log("Theme updated successfully!");
