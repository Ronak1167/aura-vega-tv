const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function record() {
  const outputDir = path.join(__dirname, 'recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const ffmpegExe = "C:\\Users\\Ronak Jain\\AppData\\Roaming\\Python\\Python314\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe";
  const audioTrack = path.join(__dirname, 'full_narration.mp3');

  console.log('====================================================');
  console.log('LAUNCHING PLAYWRIGHT FOR AURA FIRE TV DEMO RECORDING');
  console.log('Target Duration: ~226.8 seconds (3.78 minutes)');
  console.log('Audio Track:', audioTrack);
  console.log('====================================================');

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
  console.log('Loading Fire TV Harness:', harnessPath);

  await page.goto(harnessPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Set timeout to 8 minutes
  page.setDefaultTimeout(480000);

  console.log('Executing synchronized runDemoAutomation() across all 6 screens...');
  const startTime = Date.now();
  await page.evaluate(async () => {
    return await window.runDemoAutomation();
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Demo automation completed in ${elapsed}s. Settling final frames...`);
  await page.waitForTimeout(4000);

  const video = page.video();
  const rawVideoPath = video ? await video.path() : null;

  await page.close();
  await context.close();
  await browser.close();

  console.log('Playwright closed. Raw recording captured at:', rawVideoPath);

  let sourceVideo = rawVideoPath;
  if (!sourceVideo || !fs.existsSync(sourceVideo)) {
    const webmFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
    if (webmFiles.length > 0) {
      webmFiles.sort((a, b) => fs.statSync(path.join(outputDir, b)).mtimeMs - fs.statSync(path.join(outputDir, a)).mtimeMs);
      sourceVideo = path.join(outputDir, webmFiles[0]);
    }
  }

  if (!sourceVideo || !fs.existsSync(sourceVideo)) {
    throw new Error('Raw video recording not found in ' + outputDir);
  }

  const finalMp4 = path.join(outputDir, 'aura_vega_fire_tv_final_presentation.mp4');
  console.log('Muxing video with professional narration track into MP4...');
  console.log('FFmpeg:', ffmpegExe);

  // Mux video + audio with FFmpeg into high quality H.264 + AAC
  const muxCmd = `"${ffmpegExe}" -y -i "${sourceVideo}" -i "${audioTrack}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -c:a aac -b:a 192k -shortest "${finalMp4}"`;
  console.log('Running:', muxCmd);
  execSync(muxCmd, { stdio: 'inherit' });

  console.log('Final Master Presentation Video Created:', finalMp4);

  // Copy to artifacts directory
  const artifactDir = "C:\\Users\\Ronak Jain\\.gemini\\antigravity-ide\\brain\\34a72f41-9aaa-4e79-8b55-2235f32bd49d";
  if (fs.existsSync(artifactDir)) {
    const artifactDest = path.join(artifactDir, 'aura_vega_fire_tv_final_presentation.mp4');
    fs.copyFileSync(finalMp4, artifactDest);
    console.log('Master Video copied to artifacts:', artifactDest);
  }

  console.log('ALL RECORDING & AUDIO MUXING COMPLETED SUCCESSFULLY!');
}

record().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
