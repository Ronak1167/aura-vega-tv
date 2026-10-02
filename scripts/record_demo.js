const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function record() {
  const outputDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium for 1080p TV Demo Recording...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  const harnessPath = 'file://' + path.resolve(__dirname, 'tv-harness', 'index.html').replace(/\\/g, '/');
  console.log('Navigating to TV harness:', harnessPath);

  await page.goto(harnessPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  page.setDefaultTimeout(300000);
  console.log('Executing 2.8-minute runDemoAutomation()...');
  await page.evaluate(async () => {
    return await window.runDemoAutomation();
  });

  console.log('Demo automation completed. Settling final frames...');
  await page.waitForTimeout(3000);

  // Get video object before closing
  const video = page.video();
  const videoPath = video ? await video.path() : null;

  await page.close();
  await context.close();
  await browser.close();

  console.log('Browser closed.');
  if (videoPath && fs.existsSync(videoPath)) {
    console.log('RAW_RECORDING_PATH:' + videoPath);
  } else {
    // Look up newest webm in outputDir
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      files.sort((a, b) => fs.statSync(path.join(outputDir, b)).mtimeMs - fs.statSync(path.join(outputDir, a)).mtimeMs);
      console.log('RAW_RECORDING_PATH:' + path.join(outputDir, files[0]));
    } else {
      throw new Error('No video recording found in ' + outputDir);
    }
  }
}

record().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
