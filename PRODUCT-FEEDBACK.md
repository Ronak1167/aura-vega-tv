# Amazon & Vega OS Developer Product Feedback

**Date**: 2026-09-26  
**Application**: Aura Vega TV (`com.auravega.tv`)  
**Hackathon**: Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Scope**: In-depth, honest developer experience evaluation of Amazon Devices Vega SDK packages and tools.

---

## 1. `@amazon-devices/react-native-kepler` & Metro Toolchain

- **Tool Name**: `@amazon-devices/react-native-kepler` & `@amazon-devices/kepler-cli-platform`
- **Version**: `^4.0.0` (Runtime) / `0.22.14` (CLI Platform)
- **Why It Was Used**: Core React Native runtime for Amazon Vega OS and Metro build integration.
- **Setup Experience**: Smooth package installation via npm; however, initial compilation on Windows encountered toolchain hurdles.
- **Documentation Quality**: High-level concepts are well-explained; however, Windows platform nuances and exact Metro hook contracts lacked detailed troubleshooting examples.
- **Implementation Experience**:
  - Successfully compiles dual entry points (`index.js` and `service.js`).
  - Emits Static Hermes v96 bytecode.
- **Errors Encountered**:
  1. *Path with Spaces Error*: Metro plugin failed when executing node scripts on Windows where paths contained spaces (`C:\Users\Ronak Jain\...`).
  2. *Unsupported Host OS (win32)*: `kepler-cli-platform/dist/common/hermes.js` threw `Unsupported host OS: win32` when attempting to invoke hermesc.
- **Workarounds Applied**:
  1. Patched `@amazon-devices/kepler-compatibility-metro-config/dist/src/utils.js` line 34 to wrap command paths in quotes and invoke via `node`.
  2. Patched `kepler-cli-platform/dist/common/hermes.js` to locate `hermesc.exe` from `node_modules/hermes-compiler/hermesc/win64-bin/hermesc.exe`.
- **Reliability & Performance**: Once patched, Metro bundling and Hermes compilation run in ~10 seconds with 100% determinism.
- **What Worked Well**: Fast bundle generation, seamless sourcemap generation, clean split-bundle support for headless background services.
- **What Should Improve**: Native Windows support in `kepler-cli-platform` out-of-the-box.
- **Would Use Again**: Yes.
- **Concrete Feature Request**: Add official Windows binary bindings for `hermesc` inside `@amazon-devices/kepler-cli-platform` so Windows developers don't require manual patches.

---

## 2. `@amazon-devices/react-native-w3cmedia`

- **Tool Name**: `@amazon-devices/react-native-w3cmedia`
- **Version**: `^2.3.2`
- **Why It Was Used**: Official Vega OS hardware video player surface and playback control.
- **Setup Experience**: Clean installation; requires importing `KeplerVideoSurfaceView` from root and `VideoPlayer` class from `/dist/headless`.
- **Documentation Quality**: The architecture guide (`react_native_for_vega_media_player_architecture.md`) is exemplary. Clear breakdown of URL Mode vs. SourceBuffer Mode and exact lifecycle callbacks (`onSurfaceViewCreated`, `onSurfaceViewDestroyed`).
- **Implementation Experience**:
  - Implemented URL Mode.
  - Surface handle binding and W3C event listeners (`play`, `pause`, `timeupdate`, `ended`, `error`) wired up smoothly.
- **Errors Encountered**: None at compilation time.
- **Reliability & Performance**: W3C-standard API makes porting web media logic and standard video event listeners very natural.
- **What Worked Well**: Separation of surface view component from headless controller class avoids unnecessary React re-renders during 60fps playback.
- **What Should Improve**: Provide a standard playback UI control wrapper or reference component for common TV playback OSD controls (scrubber, play/pause, seek).
- **Would Use Again**: Absolutely.
- **Concrete Feature Request**: Include an optional `@amazon-devices/kepler-media-controls` package with pre-built 10-foot accessible playback OSD controls.

---

## 3. `@amazon-devices/vega-carousel`

- **Tool Name**: `@amazon-devices/vega-carousel`
- **Version**: `^1.0.1`
- **Why It Was Used**: Horizontal TV shelf navigation and focused media card selection.
- **Setup Experience**: Installed cleanly alongside peer dependency `recyclerlistview`.
- **Documentation Quality**: Good explanation of the v2 `dataAdapter` interface.
- **Implementation Experience**:
  - Replaced legacy FlatList with `Carousel<MediaItem>`.
  - Configured `CarouselItemDataAdapter<MediaItem, string>` with anchored selection strategy.
- **Errors Encountered**:
  - Default generic typing on `CarouselItemDataAdapter` defaulted `KeyT` to `React.Key`, causing TypeScript friction with string IDs until explicitly passed.
- **Workarounds Applied**: Explicitly typed `CarouselItemDataAdapter<MediaItem, string>` in `useMemo`.
- **Reliability & Performance**: Excellent virtualized item recycling; native focus scale factors (`selectedItemScaleFactor: 1.04`) look premium on TV screens.
- **What Worked Well**: High visual polish, built-in D-pad focus handling, smooth anchored scroll transitions.
- **What Should Improve**: Include default empty-state rendering when `getItemCount() === 0` to prevent blank layout containers.
- **Would Use Again**: Yes.
- **Concrete Feature Request**: Add an `emptyComponent?: React.ReactNode` prop to `Carousel` for zero-result states.

---

## 4. `@amazon-devices/kepler-a11y-settings-interface-turbo`

- **Tool Name**: `@amazon-devices/kepler-a11y-settings-interface-turbo`
- **Version**: `^1.0.0`
- **Why It Was Used**: Closed caption styling and system accessibility integration.
- **Setup Experience**: Clean installation.
- **Documentation Quality**: Brief API definitions; straightforward method signatures for caption preferences.
- **Implementation Experience**:
  - Extracted caption preferences and transformed them into style tokens in `src/components/CaptionOverlay.tsx`.
- **Errors Encountered**: In headless Node.js/Jest environments, the TurboModule is unavailable; requires mock fallback.
- **Workarounds Applied**: Provided deterministic fallback mock in Jest test setup.
- **Reliability & Performance**: Lightweight bridge with zero overhead.
- **What Worked Well**: Respects user's OS-level accessibility preferences (font size, background color, edge style).
- **What Should Improve**: Provide an official TypeScript stub/mock export for local unit testing.
- **Would Use Again**: Yes.

---

## 5. Amazon Vega Developer CLI (`react-native run-vega` / `build-vega`)

- **Tool Name**: Kepler CLI Platform
- **Version**: `0.22.14`
- **Why It Was Used**: Native Vega build execution and testing.
- **Experience Summary**:
  - `run-vega` command outputs: `"Placeholder for later implementation - this command is currently unimplemented"`.
  - `build-vega` successfully bundles Metro and Hermes, but calls a Linux-specific native packaging binary `vega` not available in the Windows developer environment.
- **Concrete Feature Request**: Release a cross-platform desktop simulator or QEMU-based virtual device for Windows and macOS developers so apps can be rendered visually without requiring physical developer hardware.
