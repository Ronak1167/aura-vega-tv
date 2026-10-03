const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const harnessPath = 'file:///' + path.resolve(__dirname, 'tv-harness', 'index.html').replace(/\\/g, '/');
  await page.goto(harnessPath);
  await page.waitForTimeout(3000); // wait for boot

  const report = await page.evaluate(() => {
    const checks = [
      { id: 'hero-cw', desc: 'Hero co-watching pill' },
      { id: 'track-picks', desc: 'Top picks shelf' },
      { id: 'track-ai', desc: 'Gemini AI shelf' },
      { id: 'track-prime', desc: 'Prime shelf' },
      { id: 's-cons', desc: 'Consensus screen' },
      { id: 'vbox-m', desc: 'Meera voter box' },
      { id: 'meera-status-text', desc: 'Meera status text' },
      { id: 's-play', desc: 'Player screen' },
      { id: 'player-canvas-wrap', desc: 'Player SVG canvas' },
      { id: 'xray-hud', desc: 'X-Ray HUD' },
      { id: 's-arch', desc: 'Architecture screen' },
      { id: 's-amb', desc: 'Ambient screen' },
      { id: 'amb-clock', desc: 'Ambient clock' },
      { id: 'amb-date', desc: 'Ambient date' },
      { id: 'fire-remote-hud', desc: 'Fire TV remote HUD' }
    ];

    const results = checks.map(c => {
      const el = document.getElementById(c.id);
      return { id: c.id, desc: c.desc, found: !!el };
    });

    const fns = ['go', 'previewCard', 'scrollShelf', 'scrollHomeVertical', 'launchPlayer', 'togglePlayback', 'toggleXray', 'runDemoAutomation'];
    const fnResults = fns.map(f => ({ fn: f, exists: typeof window[f] === 'function' }));

    return { results, fnResults };
  });

  console.log('DOM Elements Check:');
  report.results.forEach(r => console.log(`  ${r.found ? '✅' : '❌'} [${r.id}] ${r.desc}`));

  console.log('\nGlobal Functions Check:');
  report.fnResults.forEach(f => console.log(`  ${f.exists ? '✅' : '❌'} window.${f}`));

  const allGood = report.results.every(r => r.found) && report.fnResults.every(f => f.exists);
  console.log(`\nOverall Integrity: ${allGood ? 'ALL PASSED 100%' : 'FAILURES DETECTED'}`);

  await browser.close();
})();
