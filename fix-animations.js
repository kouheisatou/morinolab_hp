const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'morinolab_hp/components/sections/team.tsx',
  'morinolab_hp/components/sections/lectures.tsx',
  'morinolab_hp/components/sections/news.tsx',
  'morinolab_hp/components/sections/career.tsx',
];

// Replace patterns
const replacements = [
  // Fix destructuring syntax
  {
    from: /const { elementRef: (\w+), isVisible: (\w+) } =[\s\S]*?useFadeInAnimation<[^>]+>\([^)]*\);/g,
    to: (match, refName, visibleName) => {
      const animationName = refName.replace('Ref', 'Animation');
      return `const ${animationName} = useFadeInAnimation({ delay: 100, duration: 1000 });`;
    }
  },
  // Fix ref usage in JSX
  {
    from: /ref=\{(\w+Ref)\}/g,
    to: (match, refName) => {
      const animationName = refName.replace('Ref', 'Animation');
      return `ref={${animationName}.ref}`;
    }
  },
  // Fix className with conditional
  {
    from: /className=\{`([^`]*)\$\{[\s\S]*?\?\s*'[^']*'\s*:\s*'[^']*'[\s\S]*?\}`\}/g,
    to: (match, baseClass) => `style={${match.match(/(\w+)Animation/)?.[1] || 'title'}Animation.style} className="${baseClass}"`
  },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Apply basic replacements
    content = content.replace(/elementRef:/g, 'ref:');
    content = content.replace(/{ forceVisible: true }/g, '{ delay: 100, duration: 1000 }');
    
    // Save the file
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('Animation fixes completed'); 