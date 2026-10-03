const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const harnessPath = 'file:///' + path.resolve(__dirname, 'tv-harness', 'index.html').replace(/\\/g, '/');
    console.log('Navigating to', harnessPath);
    await page.goto(harnessPath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000); // let boot sequence complete to home
    
    const outDir = path.join(__dirname, 'recordings');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    await page.screenshot({ path: path.join(outDir, 'test_home_current.png') });
    console.log('Home screenshot captured');
    
    // Go to cons
    await page.evaluate(() => window.go('cons'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'test_cons_current.png') });
    console.log('Cons screenshot captured');

    // Go to play
    await page.evaluate(() => window.launchPlayer(1));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'test_play_current.png') });
    console.log('Play screenshot captured');

    // Go to arch
    await page.evaluate(() => window.go('arch'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'test_arch_current.png') });
    console.log('Arch screenshot captured');

    // Go to amb
    await page.evaluate(() => window.go('amb'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'test_amb_current.png') });
    console.log('Amb screenshot captured');
    
    await browser.close();
    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error taking screenshots:', err);
  }
})();
