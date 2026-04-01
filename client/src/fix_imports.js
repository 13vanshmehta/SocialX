const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/hp/Desktop/Projects/SocialX - A Social Media Platform/client/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("'framer-motion'") || content.includes('"framer-motion"')) {
        console.log(`Fixing: ${fullPath}`);
        content = content.replace(/'motion\/react'/g, "'framer-motion'");
        content = content.replace(/"motion\/react"/g, '"framer-motion"');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

walk(directory);
console.log('Finished fixing imports.');
