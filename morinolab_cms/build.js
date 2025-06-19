const fs = require('fs');
const path = require('path');

// Function to recursively remove directory
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing directory: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Function to recursively copy directory
function copyDir(src, dest) {
  console.log(`Copying ${src} -> ${dest}`);
  
  // Remove destination if it exists
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  // Create destination directory
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  
  // Copy files
  fs.cpSync(src, dest, { recursive: true, force: true });
}

// Function to check if file exists and compare timestamps
function needsUpdate(src, dest) {
  if (!fs.existsSync(dest)) {
    return true;
  }
  
  const srcStats = fs.statSync(src);
  const destStats = fs.statSync(dest);
  
  return srcStats.mtime > destStats.mtime;
}

// Main build process
async function build() {
  console.log('Starting build process...');
  
  try {
    const distDir = path.join(__dirname, 'dist');
    const srcRenderer = path.join(__dirname, 'src', 'renderer');
    const destRenderer = path.join(__dirname, 'dist', 'renderer');
    
    // Clean dist directory
    console.log('Cleaning dist directory...');
    removeDir(distDir);
    
    // Create dist directory
    fs.mkdirSync(distDir, { recursive: true });
    
    // Copy renderer files (always copy to ensure latest version)
    console.log('Copying renderer files...');
    copyDir(srcRenderer, destRenderer);
    
    // Copy configuration files if they exist
    console.log('Copying configuration files...');
    const configSrc = path.join(__dirname, 'config');
    const configDest = path.join(__dirname, 'dist', 'config');
    
    if (fs.existsSync(configSrc)) {
      copyDir(configSrc, configDest);
      console.log('GitHub configuration files copied');
    } else {
      console.log('No configuration files found (GitHub setup may be required)');
    }
    
    // Add cache-busting timestamp to HTML file
    console.log('Adding cache-busting to HTML file...');
    const htmlPath = path.join(destRenderer, 'index.html');
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const timestamp = Date.now();
      
      // Add timestamp as a comment and meta tag for cache busting
      const cacheMetaTag = `    <meta name="build-timestamp" content="${timestamp}" />
    <!-- Build timestamp: ${new Date().toISOString()} -->`;
      
      htmlContent = htmlContent.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />
${cacheMetaTag}`
      );
      
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      console.log(`Added cache-busting timestamp: ${timestamp}`);
    }
    
    console.log('Build process completed successfully!');
    
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build }; 