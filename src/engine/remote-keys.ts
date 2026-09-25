/**
 * Fire TV Remote Keycode constants for Vega OS
 * Maps hardware D-Pad and media button events to standardized identifiers.
 */

export const RemoteKeys = {
  DPAD_UP: 'ArrowUp',
  DPAD_DOWN: 'ArrowDown',
  DPAD_LEFT: 'ArrowLeft',
  DPAD_RIGHT: 'ArrowRight',
  SELECT: 'Select',
  ENTER: 'Enter',
  BACK: 'Back',
  ESCAPE: 'Escape',
  MENU: 'Menu',
  PLAY_PAUSE: 'MediaPlayPause',
  FAST_FORWARD: 'MediaFastForward',
  REWIND: 'MediaRewind',
} as const;

export type RemoteKeyType = typeof RemoteKeys[keyof typeof RemoteKeys];

export const KeyCodes = {
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  SELECT: 23,
  BACK: 4,
  MENU: 82,
  PLAY_PAUSE: 85,
} as const;
