const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Function to safely copy dependencies with conflict detection
function copyDependencies(srcDir, destDir, dependencies) {
  // Check if dest is a subdirectory of src to prevent circular copying
  const srcRealPath = fs.realpathSync(srcDir);
  const destRealPath = path.resolve(destDir);
  
  if (destRealPath.startsWith(srcRealPath)) {
    console.error('Error: Destination is a subdirectory of source. This would create circular copying.');
    console.error(`Source: ${srcRealPath}`);
    console.error(`Destination: ${destRealPath}`);
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  for (const dep of dependencies) {
    const srcPath = path.join(srcDir, dep);
    const destPath = path.join(destDir, dep);
    
    if (fs.existsSync(srcPath)) {
      // Additional safety check for each individual copy
      try {
        const srcStat = fs.lstatSync(srcPath);
        if (srcStat.isSymbolicLink()) {
          // Handle symbolic links carefully on different platforms
          const linkTarget = fs.readlinkSync(srcPath);
          console.log(`Copying symlink ${dep} -> ${linkTarget}`);
          
          // Create symlink in destination
          if (!fs.existsSync(destPath)) {
            fs.symlinkSync(linkTarget, destPath);
          }
        } else {
          console.log(`Copying ${dep}...`);
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true });
          }
          fs.cpSync(srcPath, destPath, { recursive: true, force: true });
        }
      } catch (error) {
        console.warn(`Warning: Failed to copy ${dep}: ${error.message}`);
      }
    } else {
      console.warn(`Warning: ${dep} not found in ${srcDir}`);
    }
  }
}

// Function to detect the correct electron app path based on platform and build output
function findElectronAppPath() {
  const outDir = path.join(__dirname, 'out');
  
  if (!fs.existsSync(outDir)) {
    throw new Error('Output directory not found. Make sure to run electron-forge make first.');
  }
  
  // Look for make directory first (for make command)
  const makeDir = path.join(outDir, 'make');
  if (fs.existsSync(makeDir)) {
    const appDirs = [];
    
    // Find all 'app' directories in make output
    function findAppDirs(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name);
          if (entry.name === 'app') {
            appDirs.push(fullPath);
          } else {
            findAppDirs(fullPath);
          }
        }
      }
    }
    
    findAppDirs(makeDir);
    
    if (appDirs.length > 0) {
      return path.relative(__dirname, appDirs[0]);
    }
  }
  
  // Fallback: Look for package directory
  const packageDirs = fs.readdirSync(outDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
    
  // Platform-specific fallbacks
  const platform = os.platform();
  let appPath = null;
  
  for (const dir of packageDirs) {
    const fullPath = path.join(outDir, dir);
    
    if (platform === 'darwin' && dir.includes('darwin')) {
      // macOS: Look for .app bundle
      const appFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.app'));
      if (appFiles.length > 0) {
        appPath = path.join('out', dir, appFiles[0], 'Contents', 'Resources', 'app');
        break;
      }
    } else if (platform === 'win32' && dir.includes('win32')) {
      // Windows: Look for resources/app
      const resourcesPath = path.join(fullPath, 'resources', 'app');
      if (fs.existsSync(resourcesPath)) {
        appPath = path.join('out', dir, 'resources', 'app');
        break;
      }
    } else if (platform === 'linux' && dir.includes('linux')) {
      // Linux: Look for resources/app
      const resourcesPath = path.join(fullPath, 'resources', 'app');
      if (fs.existsSync(resourcesPath)) {
        appPath = path.join('out', dir, 'resources', 'app');
        break;
      }
    }
  }
  
  if (!appPath) {
    throw new Error(`Could not find electron app directory for platform ${platform}. Available directories: ${packageDirs.join(', ')}`);
  }
  
  return appPath;
}

// Main execution
try {
  const rootNodeModules = path.join(__dirname, '..', 'node_modules');
  
  // Get electron app path from command line argument or auto-detect
  let electronAppPath;
  if (process.argv[2]) {
    electronAppPath = process.argv[2];
    console.log(`Using provided electron app path: ${electronAppPath}`);
  } else {
    electronAppPath = findElectronAppPath();
    console.log(`Auto-detected electron app path: ${electronAppPath}`);
  }
  
  const destNodeModules = path.join(__dirname, electronAppPath, 'node_modules');
  
  console.log(`Source node_modules: ${rootNodeModules}`);
  console.log(`Destination node_modules: ${destNodeModules}`);
  
  // Dependencies that need to be copied
  const requiredDeps = [
    'gray-matter', 
    'papaparse', 
    'electron-squirrel-startup', 
    'dotenv',
    '@octokit/rest',
    'pica',
    'simple-git'
  ];

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
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 