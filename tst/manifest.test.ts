import * as fs from 'fs';
import * as path from 'path';

describe('Vega OS Manifest Validation', () => {
  const manifestPath = path.resolve(__dirname, '../manifest.toml');

  it('should exist in project root', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('should have required Vega sections and correct identifiers', () => {
    const content = fs.readFileSync(manifestPath, 'utf8');

    // Package identification
    expect(content).toContain('id = "com.auravega.tv"');
    expect(content).toContain('min = "1.2"');
    expect(content).toContain('target = "1.2"');

    // UI entry & Headless Service entry
    expect(content).toContain('entry = "index.js"');
    expect(content).toContain('headless_entry = "service.js"');

    // Required IPC / capabilities
    expect(content).toContain('"com.amazon.vega.display"');
    expect(content).toContain('"com.amazon.vega.input.remote"');
    expect(content).toContain('"com.amazon.media.server"');
    expect(content).toContain('"com.amazon.network.access"');

    // Kepler 4 runtime modules
    expect(content).toContain('/com.amazon.kepler.runtime.react_native_kepler_4@IReactNativeKepler_0');
    expect(content).toContain('/com.amazon.kepler.runtime.react_native_kepler_headless_4@IReactNativeKeplerHeadless_0');
  });
});
