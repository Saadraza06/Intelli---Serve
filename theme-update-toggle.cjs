const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backgrounds
  content = content.replace(/(?<!dark:)bg-black\/80/g, 'bg-white/80 dark:bg-black/80');
  content = content.replace(/(?<!dark:)bg-slate-900\/50/g, 'bg-zinc-50 dark:bg-slate-900/50');
  content = content.replace(/(?<!dark:)bg-slate-900/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/(?<!dark:)bg-black/g, 'bg-zinc-50 dark:bg-black');
  content = content.replace(/(?<!dark:)bg-slate-800/g, 'bg-zinc-100 dark:bg-slate-800');
  
  // Text
  content = content.replace(/(?<!dark:)text-white/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/(?<!dark:)text-slate-200/g, 'text-zinc-800 dark:text-slate-200');
  content = content.replace(/(?<!dark:)text-slate-300/g, 'text-zinc-600 dark:text-slate-300');
  content = content.replace(/(?<!dark:)text-slate-400/g, 'text-zinc-500 dark:text-slate-400');
  content = content.replace(/(?<!dark:)text-slate-500/g, 'text-zinc-400 dark:text-slate-500');
  
  // Borders
  content = content.replace(/(?<!dark:)border-slate-700/g, 'border-zinc-300 dark:border-slate-700');
  content = content.replace(/(?<!dark:)border-slate-800\/50/g, 'border-zinc-100 dark:border-slate-800/50');
  content = content.replace(/(?<!dark:)border-slate-800/g, 'border-zinc-200 dark:border-slate-800');
  
  // Accents
  content = content.replace(/(?<!dark:)bg-green-700/g, 'bg-emerald-500 dark:bg-green-700');
  content = content.replace(/(?<!dark:)bg-purple-900\/30/g, 'bg-emerald-50 dark:bg-purple-900/30');
  content = content.replace(/(?<!dark:)text-green-500/g, 'text-emerald-700 dark:text-green-500');
  content = content.replace(/(?<!dark:)hover:bg-purple-900\/50/g, 'hover:bg-emerald-100 dark:hover:bg-purple-900/50');
  
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

console.log("Light/Dark mode responsive classes added successfully!");
