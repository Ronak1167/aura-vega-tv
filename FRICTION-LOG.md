# Amazon Vega OS Developer Experience — Friction Log

**Application**: Aura Vega TV (`com.auravega.tv`)  
**Platform**: React Native 0.83 on Vega OS SDK 0.24 / Kepler CLI Platform 0.22.14  
**Host OS**: Windows 11 (Developer Machine)  
**Hackathon**: Build, Ship, Shape: Amazon Developer Hackathon 2026

This log documents every real friction point, error, and blocker encountered during development of a production-grade Vega OS application on a Windows developer environment, along with the exact resolution for each.

---

## [CRITICAL] FL-001 — Path-With-Spaces Metro Plugin Failure

| Field | Value |
| :--- | :--- |
| **Severity** | Critical (Blocks all Metro bundling on affected machines) |
| **File** | `node_modules/@amazon-devices/kepler-compatibility-metro-config/dist/src/utils.js` |
| **Affected Line** | 34 |
| **Trigger** | Any Windows developer whose OS username contains a space (e.g. `Ronak Jain` → `C:\Users\Ronak Jain`) |
| **Error Message** | `'Jain' is not recognized as an internal or external command, operable program or batch file.` |

**Root Cause**: The Metro plugin invokes a Node.js script via a raw shell string without quoting the path, causing the command to split at the space character.

**Resolution Applied**:
```diff
-  execSync(`node ${scriptPath}`, { ... });
+  execSync(`node "${scriptPath}"`, { ... });
```

**Amazon Action Required**: Quote all path interpolations in `utils.js` with double-quotes before string concatenation into shell commands. This affects all Windows developers with spaces in their user directories — which is extremely common.

---

## [CRITICAL] FL-002 — Windows Hermes Compiler Missing Binary

| Field | Value |
| :--- | :--- |
| **Severity** | Critical (Blocks Static Hermes bytecode compilation) |
| **File** | `node_modules/@amazon-devices/kepler-cli-platform/dist/common/hermes.js` |
| **Trigger** | Any Windows developer running `npm run bundle:release` or `npm run bundle:debug` |
| **Error Message** | `Unsupported host OS: win32` |

**Root Cause**: `hermes.js` inside `kepler-cli-platform` contains a platform switch that explicitly throws for `win32`, even though `hermesc.exe` for Windows is shipped inside `node_modules/hermes-compiler/hermesc/win64-bin/`.

**Resolution Applied**:
```js
// Patch: manually resolve hermesc path for Windows
const hermescPath = path.join(__dirname, '../../hermes-compiler/hermesc/win64-bin/hermesc.exe');
```

**Amazon Action Required**: Add a `win32` case to the platform switch in `kepler-cli-platform/dist/common/hermes.js` that resolves the pre-bundled `win64-bin/hermesc.exe` binary, identical to how the Linux and Darwin cases work.

---

## [MODERATE] FL-003 — `run-vega` CLI Command Unimplemented

| Field | Value |
| :--- | :--- |
| **Severity** | Moderate (Blocks all runtime emulation on any developer machine) |
| **Command** | `npx react-native run-vega` |
| **Platform** | All platforms (Windows, macOS, Linux) |
| **Output** | `"Placeholder for later implementation - this command is currently unimplemented"` |

**Context**: The `build-vega` command successfully bundles and compiles to Static Hermes bytecode but calls a native Linux-only packaging binary (`vega`) unavailable in the developer distribution. There is no cross-platform Vega Virtual Device or emulator available for visual application testing.

**Impact**: Developers building on Windows or macOS cannot visually validate their applications, run end-to-end interaction tests, or confirm rendering accuracy during development, making all UI work impossible to verify without physical Fire TV developer hardware.

**Amazon Action Required**: Release a cross-platform **Vega Virtual Device (VVD)** as part of the developer SDK. A QEMU, JVM, or Docker-based device simulator would dramatically improve the developer experience and reduce the hardware dependency barrier for hackathon participants.

---

## [MODERATE] FL-004 — No Standard `jest` Mock Export for A11y TurboModule

| Field | Value |
| :--- | :--- |
| **Severity** | Moderate (Blocks unit testing of any code importing the A11y TurboModule) |
| **Package** | `@amazon-devices/kepler-a11y-settings-interface-turbo` |
| **Environment** | Node.js / Jest (no native runtime bridge available) |
| **Error Without Fix** | `Cannot find native module 'KeplerA11ySettingsInterface'` |

**Resolution Applied**: Manually authored a Jest module mock:
```js
jest.mock('@amazon-devices/kepler-a11y-settings-interface-turbo', () => ({
  getClosedCaptionStyle: jest.fn().mockResolvedValue({ fontSize: 'medium', backgroundColor: 'black' }),
}));
```

**Amazon Action Required**: Ship a `@amazon-devices/kepler-a11y-settings-interface-turbo/jest` export or a standard `__mocks__` directory that can be used directly in `jest.config.js` `moduleNameMapper`, matching standard React Native community conventions.

---

## [LOW] FL-005 — Carousel v2 KeyT Generic Default Causes TypeScript Friction

| Field | Value |
| :--- | :--- |
| **Severity** | Low (TypeScript compilation warning, not a runtime error) |
| **Package** | `@amazon-devices/vega-carousel` |
| **Issue** | `CarouselItemDataAdapter<ItemT>` defaults `KeyT` to `React.Key`, but string IDs produce a type mismatch warning |

**Resolution Applied**:
```ts
// Explicit string KeyT parameter required
const dataAdapter = useMemo<CarouselItemDataAdapter<MediaItem, string>>(
  () => ({...}),
  [items]
);
```

**Amazon Action Required**: Either default `KeyT` to `string` or update the documentation to prominently feature the two-parameter generic form `CarouselItemDataAdapter<ItemT, string>` as the expected usage pattern.

---

## [LOW] FL-006 — Metro Config Template Version Warning

| Field | Value |
| :--- | :--- |
| **Severity** | Low (Non-blocking warning printed on every bundle) |
| **Tool** | Metro v0.83.8 / `@react-native/metro-config` |
| **Warning** | `From React Native 0.73, your project's Metro config should extend '@react-native/metro-config'` |

**Context**: The Vega Metro config extends `@amazon-devices/kepler-compatibility-metro-config` rather than the standard `@react-native/metro-config`. This triggers a false-positive template warning from Metro that is irrelevant for Vega OS projects but clutters developer output.

**Amazon Action Required**: Suppress or replace the standard React Native metro-config template warning when the Vega compatibility config is detected, preventing confusing noise in developer terminal output.

---

## Summary

| ID | Severity | Status | Amazon Action Required? |
| :--- | :--- | :--- | :--- |
| FL-001 | Critical | Patched locally | Yes — Quote path strings in `utils.js` |
| FL-002 | Critical | Patched locally | Yes — Add Windows hermesc binary switch |
| FL-003 | Moderate | No workaround | Yes — Release cross-platform Vega VVD |
| FL-004 | Moderate | Worked around with manual mock | Yes — Ship Jest mock stubs |
| FL-005 | Low | Worked around | Recommended — Update generic defaults or docs |
| FL-006 | Low | Accepted as noise | Recommended — Suppress irrelevant warning |
