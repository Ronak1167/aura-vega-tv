const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'tv-harness', 'index.html');
let content = fs.readFileSync(target, 'utf8');

// Find and remove any leftover Python triple quotes
const initialLen = content.length;
content = content.replace(/"""/g, '');

// Also check if s-home has overflow-y
// In CSS:
// Let's verify #s-home styling
console.log('Removed triple quotes. Byte diff:', content.length - initialLen);

fs.writeFileSync(target, content, 'utf8');
console.log('Saved cleaned index.html');
