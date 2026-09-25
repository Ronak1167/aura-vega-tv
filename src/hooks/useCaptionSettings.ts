/**
 * useCaptionSettings.ts
 *
 * Reads OS caption on/off state and caption style preferences via
 * @amazon-devices/kepler-a11y-settings-interface-turbo.
 *
 * Per official Vega docs: "KeplerA11ySettingsInterface is a **named** export.
 * A default import resolves to undefined and crashes on first use. Feature-detect
 * the API so a missing native module degrades gracefully."
 *
 * If the module is absent (e.g. running in unit tests), all fields default to
 * false / empty — the caller renders no captions. No error is thrown.
 */
import { useEffect, useState } from 'react';

// --------------------------------------------------------------------------
// Types (mirrors the Vega turbo-module surface)
// --------------------------------------------------------------------------
export interface CaptioningProps {
  foregroundColor?: number;
  backgroundColor?: number;
  edgeType?: number;
  edgeColor?: number;
  fontFamily?: string;
  fontStyle?: number;
  fontScale?: number;
  textSizeSp?: number;
  windowColor?: number;
}

interface CaptionState {
  captionsEnabled: boolean;
  captionStyle: CaptioningProps;
}

// --------------------------------------------------------------------------
// Lazy import guard
// --------------------------------------------------------------------------
let nativeModule: {
  getCaptioningEnabled: () => Promise<boolean>;
  getCaptioningProperties: () => Promise<CaptioningProps>;
  addCaptioningEnabledListener: (
    cb: (enabled: boolean) => void,
  ) => { remove: () => void };
  addCaptioningPropertiesListener: (
    cb: (props: CaptioningProps) => void,
  ) => { remove: () => void };
} | null = null;

try {
  // Named import as per official docs
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@amazon-devices/kepler-a11y-settings-interface-turbo');
  nativeModule = mod.KeplerA11ySettingsInterface ?? null;
} catch {
  // Module not available (CI, tests, non-Vega device) — degrade gracefully
  nativeModule = null;
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------
export function useCaptionSettings(): CaptionState {
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<CaptioningProps>({});

  useEffect(() => {
    if (!nativeModule) {
      return;
    }

    // Read initial values
    nativeModule
      .getCaptioningEnabled()
      .then(setCaptionsEnabled)
      .catch(() => {});

    nativeModule
      .getCaptioningProperties()
      .then(setCaptionStyle)
      .catch(() => {});

    // Subscribe to live changes (fires whenever user changes system settings)
    const enabledSub = nativeModule.addCaptioningEnabledListener(
      setCaptionsEnabled,
    );
    const styleSub = nativeModule.addCaptioningPropertiesListener(
      setCaptionStyle,
    );

    return () => {
      enabledSub.remove();
      styleSub.remove();
    };
  }, []);

  return { captionsEnabled, captionStyle };
}
