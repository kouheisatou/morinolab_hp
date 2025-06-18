const fs = require('fs');
const path = require('path');

// Function to recursively find all dependencies
function findDependencies(packageJsonPath, rootNodeModules, visited = new Set()) {
  if (visited.has(packageJsonPath)) return [];
  visited.add(packageJsonPath);

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  let allDeps = Object.keys(dependencies);
  
  // Recursively find sub-dependencies
  for (const dep of Object.keys(dependencies)) {
    // First try nested node_modules, then root node_modules
    const nestedDepPath = path.join(path.dirname(packageJsonPath), 'node_modules', dep, 'package.json');
    const rootDepPath = path.join(rootNodeModules, dep, 'package.json');
    
    let depPath = null;
    if (fs.existsSync(nestedDepPath)) {
      depPath = nestedDepPath;
    } else if (fs.existsSync(rootDepPath)) {
      depPath = rootDepPath;
    }
    
    if (depPath) {
      allDeps = allDeps.concat(findDependencies(depPath, rootNodeModules, visited));
    }
  }
  
  return [...new Set(allDeps)]; // Remove duplicates
}

// Function to copy dependencies
function copyDependencies(srcDir, destDir, dependencies) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  for (const dep of dependencies) {
    const srcPath = path.join(srcDir, dep);
    const destPath = path.join(destDir, dep);
    
    if (fs.existsSync(srcPath)) {
      console.log(`Copying ${dep}...`);
      fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    } else {
      console.warn(`Warning: ${dep} not found in ${srcDir}`);
    }
  }
}

// Main execution
const rootNodeModules = path.join(__dirname, '..', 'node_modules');
const electronAppPath = process.argv[2] || 'out/morinolab-cms-electron-darwin-arm64/morinolab-cms-electron.app/Contents/Resources/app';
const destNodeModules = path.join(__dirname, electronAppPath, 'node_modules');

// Dependencies that need to be copied
const requiredDeps = ['gray-matter', 'papaparse', 'electron-squirrel-startup'];

// Find all dependencies including sub-dependencies
let allDeps = [];
for (const dep of requiredDeps) {
  const packageJsonPath = path.join(rootNodeModules, dep, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    allDeps = allDeps.concat(findDependencies(packageJsonPath, rootNodeModules));
  }
  allDeps.push(dep); // Include the main dependency itself
}

// Remove duplicates
allDeps = [...new Set(allDeps)];

console.log('Dependencies to copy:', allDeps);

// Copy all dependencies
copyDependencies(rootNodeModules, destNodeModules, allDeps);

console.log('Dependencies copied successfully!'); 