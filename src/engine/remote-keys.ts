/**
 * Fire TV Remote & Keyboard Keycode Bindings
 * Compliant with Amazon Fire TV remote specifications & Vega OS input events.
 */

export const RemoteKeys = {
  UP: ['ArrowUp', 'Up', '38'],
  DOWN: ['ArrowDown', 'Down', '40'],
  LEFT: ['ArrowLeft', 'Left', '37'],
  RIGHT: ['ArrowRight', 'Right', '39'],
  SELECT: ['Enter', ' ', 'Select', '13'],
  BACK: ['Escape', 'Backspace', 'BrowserBack', 'Back', '27', '8', '10009', '10071'],
  PLAY_PAUSE: ['MediaPlayPause', 'Play', 'Pause', '179'],
  MENU: ['ContextMenu', 'Menu', '18', '82'],
  REWIND: ['MediaRewind', '227'],
  FAST_FORWARD: ['MediaFastForward', '228'],
} as const

export type RemoteAction = 
  | 'UP' 
  | 'DOWN' 
  | 'LEFT' 
  | 'RIGHT' 
  | 'SELECT' 
  | 'BACK' 
  | 'PLAY_PAUSE' 
  | 'MENU' 
  | 'REWIND' 
  | 'FAST_FORWARD'

export function getRemoteAction(e: KeyboardEvent): RemoteAction | null {
  const key = e.key
  const keyCode = String(e.keyCode)

  if (RemoteKeys.UP.includes(key as any) || RemoteKeys.UP.includes(keyCode as any)) return 'UP'
  if (RemoteKeys.DOWN.includes(key as any) || RemoteKeys.DOWN.includes(keyCode as any)) return 'DOWN'
  if (RemoteKeys.LEFT.includes(key as any) || RemoteKeys.LEFT.includes(keyCode as any)) return 'LEFT'
  if (RemoteKeys.RIGHT.includes(key as any) || RemoteKeys.RIGHT.includes(keyCode as any)) return 'RIGHT'
  if (RemoteKeys.SELECT.includes(key as any) || (RemoteKeys.SELECT.includes(keyCode as any) && key === 'Enter')) return 'SELECT'
  if (RemoteKeys.BACK.includes(key as any) || RemoteKeys.BACK.includes(keyCode as any)) return 'BACK'
  if (RemoteKeys.PLAY_PAUSE.includes(key as any) || RemoteKeys.PLAY_PAUSE.includes(keyCode as any)) return 'PLAY_PAUSE'
  if (RemoteKeys.MENU.includes(key as any) || RemoteKeys.MENU.includes(keyCode as any)) return 'MENU'
  if (RemoteKeys.REWIND.includes(key as any) || RemoteKeys.REWIND.includes(keyCode as any)) return 'REWIND'
  if (RemoteKeys.FAST_FORWARD.includes(key as any) || RemoteKeys.FAST_FORWARD.includes(keyCode as any)) return 'FAST_FORWARD'

  return null
}
