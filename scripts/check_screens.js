const fs = require('fs');
const path = require('path');

const files = ['v2_home.png', 'v2_cons.png', 'v2_play.png', 'v2_arch.png', 'v2_amb.png'];
for (const f of files) {
  const p = path.join(__dirname, 'recordings', f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`${f}: ${stat.size} bytes`);
  } else {
    console.log(`${f}: NOT FOUND`);
  }
}
