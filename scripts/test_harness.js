const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));

  const harnessPath = 'file:///' + path.resolve(__dirname, 'tv-harness', 'index.html').replace(/\\/g, '/');
  await page.goto(harnessPath);
  await page.waitForTimeout(1000);

  const screens = ['home', 'cons', 'play', 'arch', 'amb'];
  for (const s of screens) {
    console.log(`\n--- Testing go("${s}") ---`);
    await page.evaluate((target) => {
      if (typeof window.go === 'function') {
        window.go(target);
      } else {
        console.error('window.go is not defined!');
      }
    }, s);
    await page.waitForTimeout(1000);
    
    // Check active screen in DOM
    const activeInfo = await page.evaluate((target) => {
      const el = document.getElementById('s-' + target);
      if (!el) return { exists: false };
      const style = window.getComputedStyle(el);
      return {
        exists: true,
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility,
        innerHTML_length: el.innerHTML.length,
        childElementCount: el.childElementCount
      };
    }, s);
    console.log(`Screen "${s}":`, JSON.stringify(activeInfo));
  }

  await browser.close();
})();
