/**
 * 10-Foot TV Spatial Focus Engine
 * Cartesian 2D vector coordinate navigation for Fire TV D-pad & Vega OS.
 */

import { soundEffects } from './sound-effects'
import { getRemoteAction, RemoteAction } from './remote-keys'

export interface FocusableNode {
  id: string
  el: HTMLElement
  group?: string
  priority?: number
  onSelect?: () => void
}

class SpatialFocusEngine {
  private nodes: Map<string, FocusableNode> = new Map()
  private currentId: string | null = null
  private listeners: Set<(id: string | null) => void> = new Set()
  private isInitialized = false

  public register(node: FocusableNode) {
    this.nodes.set(node.id, node)
    node.el.setAttribute('data-focus-id', node.id)
    node.el.classList.add('tv-focusable')

    // If no node is focused yet, make this one the initial focus
    if (!this.currentId) {
      this.setFocus(node.id, false)
    }
  }

  public unregister(id: string) {
    this.nodes.delete(id)
    if (this.currentId === id) {
      // Find a fallback node
      const nextNode = this.nodes.values().next().value
      this.setFocus(nextNode ? nextNode.id : null, false)
    }
  }

  public subscribe(cb: (id: string | null) => void) {
    this.listeners.add(cb)
    cb(this.currentId)
    return () => {
      this.listeners.delete(cb)
    }
  }

  public getCurrentId(): string | null {
    return this.currentId
  }

  public setFocus(id: string | null, playAudio = true) {
    if (this.currentId && this.nodes.has(this.currentId)) {
      const prevEl = this.nodes.get(this.currentId)!.el
      prevEl.classList.remove('is-focused')
      prevEl.blur()
    }

    this.currentId = id

    if (id && this.nodes.has(id)) {
      const nextNode = this.nodes.get(id)!
      nextNode.el.classList.add('is-focused')
      nextNode.el.focus({ preventScroll: true })
      nextNode.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      if (playAudio) {
        soundEffects.playFocusMove()
      }
    }

    this.listeners.forEach(cb => cb(this.currentId))
  }

  public move(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): boolean {
    if (!this.currentId || !this.nodes.has(this.currentId)) {
      const first = this.nodes.values().next().value
      if (first) {
        this.setFocus(first.id)
        return true
      }
      return false
    }

    const currentEl = this.nodes.get(this.currentId)!.el
    const currentRect = currentEl.getBoundingClientRect()
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    }

    let bestCandidate: FocusableNode | null = null
    let minDistance = Infinity

    for (const candidate of this.nodes.values()) {
      if (candidate.id === this.currentId) continue

      // Ignore elements hidden or detached
      if (!candidate.el.offsetParent && candidate.el.offsetWidth === 0) continue

      const candRect = candidate.el.getBoundingClientRect()
      const candCenter = {
        x: candRect.left + candRect.width / 2,
        y: candRect.top + candRect.height / 2
      }

      const dx = candCenter.x - currentCenter.x
      const dy = candCenter.y - currentCenter.y

      let isAligned = false
      let primaryDist = 0
      let secondaryDist = 0

      switch (direction) {
        case 'UP':
          if (dy < -10) {
            isAligned = true
            primaryDist = Math.abs(dy)
            secondaryDist = Math.abs(dx)
          }
          break
        case 'DOWN':
          if (dy > 10) {
            isAligned = true
            primaryDist = Math.abs(dy)
            secondaryDist = Math.abs(dx)
          }
          break
        case 'LEFT':
          if (dx < -10) {
            isAligned = true
            primaryDist = Math.abs(dx)
            secondaryDist = Math.abs(dy)
          }
          break
        case 'RIGHT':
          if (dx > 10) {
            isAligned = true
            primaryDist = Math.abs(dx)
            secondaryDist = Math.abs(dy)
          }
          break
      }

      if (isAligned) {
        // Spatial projection penalty: heavily penalize orthogonal drift to keep rows/cols clean
        const weightedDist = primaryDist + (secondaryDist * 2.8)
        if (weightedDist < minDistance) {
          minDistance = weightedDist
          bestCandidate = candidate
        }
      }
    }

    if (bestCandidate) {
      this.setFocus(bestCandidate.id)
      return true
    }

    return false
  }

  public activateCurrent(): boolean {
    if (!this.currentId || !this.nodes.has(this.currentId)) return false
    const node = this.nodes.get(this.currentId)!
    soundEffects.playSelect()
    if (node.onSelect) {
      node.onSelect()
    } else {
      node.el.click()
    }
    return true
  }

  public initGlobalListeners() {
    if (this.isInitialized || typeof window === 'undefined') return
    this.isInitialized = true

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const action = getRemoteAction(e)
      if (!action) return

      // Prevent default scrolling on TV arrow keys
      if (['UP', 'DOWN', 'LEFT', 'RIGHT', 'SELECT'].includes(action)) {
        e.preventDefault()
      }

      switch (action) {
        case 'UP':
          this.move('UP')
          break
        case 'DOWN':
          this.move('DOWN')
          break
        case 'LEFT':
          this.move('LEFT')
          break
        case 'RIGHT':
          this.move('RIGHT')
          break
        case 'SELECT':
          this.activateCurrent()
          break
        case 'BACK':
          soundEffects.playBack()
          // Emit custom back event for modals
          window.dispatchEvent(new CustomEvent('tv-back-pressed'))
          break
      }
    })
  }
}

export const spatialFocus = new SpatialFocusEngine()
