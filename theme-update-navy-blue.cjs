const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backgrounds: Make Dark Mode Navy (#0F172A which is Tailwind slate-900)
  content = content.replace(/dark:bg-black\/80/g, 'dark:bg-slate-900/80');
  content = content.replace(/dark:bg-black/g, 'dark:bg-slate-900');
  // Since we replaced dark:bg-black with dark:bg-slate-900, the old dark:bg-slate-900 needs to go one level up to 800 for contrast.
  // Wait, regex might match the newly replaced string if we do it sequentially.
  // Let's use an intermediate step:
  content = content.replace(/dark:bg-slate-900\/50/g, 'dark:bg-slate-800/50');
  content = content.replace(/dark:bg-slate-900(?![\/\-])/g, 'dark:bg-slate-800');
  // Now replace dark:bg-black with dark:bg-slate-900 safely
  content = content.replace(/dark:bg-black/g, 'dark:bg-slate-900');

  // Accents: Electric Blue & Cyan
  content = content.replace(/bg-emerald-500/g, 'bg-blue-500');
  content = content.replace(/dark:bg-green-700/g, 'dark:bg-blue-500');
  
  content = content.replace(/bg-emerald-50/g, 'bg-cyan-50');
  content = content.replace(/dark:bg-purple-900\/30/g, 'dark:bg-cyan-900/30');
  
  content = content.replace(/text-emerald-700/g, 'text-blue-600');
  content = content.replace(/dark:text-green-500/g, 'dark:text-cyan-400');
  
  content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-cyan-100');
  content = content.replace(/dark:hover:bg-purple-900\/50/g, 'dark:hover:bg-cyan-900/50');
  
  // Special overrides for header/badges
  content = content.replace(/bg-emerald-500 dark:bg-green-700/g, 'bg-blue-500 dark:bg-blue-600');
  
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

console.log("Theme updated to Dark Navy, Electric Blue, Cyan, White successfully!");
