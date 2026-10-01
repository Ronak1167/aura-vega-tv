import * as fs from 'fs';
import * as path from 'path';

describe('Vega OS Manifest Validation', () => {
  const root = path.resolve(__dirname, '..');
  const manifestPath = path.join(root, 'manifest.toml');

  it('should exist in project root', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it('should have required Vega sections and correct identifiers', () => {
    const content = fs.readFileSync(manifestPath, 'utf8');

    // Current Vega manifest schema
    expect(content).toContain('schema-version = 1');
    expect(content).toContain('title = "Aura Vega TV"');
    expect(content).toContain('id = "com.auravega.tv"');
    expect(content).toContain('min = "1.2"');
    expect(content).toContain('target = "1.2"');

    // Interactive app + background service components
    expect(content).toContain('[[components.interactive]]');
    expect(content).toContain('id = "com.auravega.tv.main"');
    expect(content).toContain('[[components.service]]');
    expect(content).toContain('id = "com.auravega.tv.service"');

    // React Native runtime
    expect(content).toContain('/com.amazon.kepler.runtime.react_native_kepler_4@IReactNativeKepler_0');

    // Required media/network capabilities
    expect(content).toContain('id = "com.amazon.media.server"');
    expect(content).toContain('id = "com.amazon.network.service"');
    expect(content).toContain('id = "com.amazon.network.privilege.net-info"');
    expect(content).toContain('id = "com.amazon.devconf.privilege.accessibility"');

    // Autolinked Kepler modules required by the current dependency graph
    expect(content).toContain('/com.amazon.kepler.w3cmedia_2@IW3cmedia_3');
    expect(content).toContain('/com.amazon.kepler.navigation__stack_8@INavigation__Stack_0');
  });

  it('should keep both JavaScript entry files in the project', () => {
    expect(fs.existsSync(path.join(root, 'index.js'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'service.js'))).toBe(true);
  });
});
