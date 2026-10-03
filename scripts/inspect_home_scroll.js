const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'tv-harness', 'index.html');
const content = fs.readFileSync(target, 'utf8');

// Find CSS rules related to s-home
const cssMatch = content.match(/#s-home\s*\{[^}]+\}/g);
console.log('CSS for #s-home:', cssMatch);

// Find DOM element for s-home
const sHomeIndex = content.indexOf('id="s-home"');
console.log('s-home HTML snippet:', content.substring(sHomeIndex - 20, sHomeIndex + 300));
