import { useEffect, useRef, useState } from 'react'
import { spatialFocus } from './spatial-focus'

export interface UseFocusableOptions {
  id: string
  group?: string
  priority?: number
  onSelect?: () => void
  autoFocus?: boolean
}

export function useFocusable<T extends HTMLElement = HTMLDivElement>({
  id,
  group,
  priority,
  onSelect,
  autoFocus
}: UseFocusableOptions) {
  const ref = useRef<T>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    spatialFocus.register({
      id,
      el,
      group,
      priority,
      onSelect
    })

    if (autoFocus) {
      spatialFocus.setFocus(id, false)
    }

    const unsubscribe = spatialFocus.subscribe((currentId) => {
      setIsFocused(currentId === id)
    })

    return () => {
      unsubscribe()
      spatialFocus.unregister(id)
    }
  }, [id, group, priority, onSelect, autoFocus])

  return {
    ref,
    isFocused,
    setFocus: () => spatialFocus.setFocus(id)
  }
}
