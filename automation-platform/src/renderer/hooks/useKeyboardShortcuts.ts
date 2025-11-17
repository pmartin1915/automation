import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
  category?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Hook to register global keyboard shortcuts
 * Handles platform detection (Cmd on Mac, Ctrl on Windows/Linux)
 * Prevents shortcuts when focus is in input fields
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlOrCmdMatches = shortcut.ctrlOrCmd
          ? isMac
            ? event.metaKey
            : event.ctrlKey
          : true
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        return keyMatches && ctrlOrCmdMatches && shiftMatches && altMatches
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
      }
    },
    [shortcuts, enabled, isMac]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])

  /**
   * Format a shortcut for display (e.g., "Cmd+R" or "Ctrl+R")
   */
  const formatShortcut = useCallback(
    (shortcut: KeyboardShortcut): string => {
      const parts: string[] = []

      if (shortcut.ctrlOrCmd) {
        parts.push(isMac ? '⌘' : 'Ctrl')
      }
      if (shortcut.shift) {
        parts.push(isMac ? '⇧' : 'Shift')
      }
      if (shortcut.alt) {
        parts.push(isMac ? '⌥' : 'Alt')
      }

      parts.push(shortcut.key.toUpperCase())

      return parts.join(isMac ? '' : '+')
    },
    [isMac]
  )

  return {
    formatShortcut,
    isMac,
  }
}

/**
 * Get the modifier key name for the current platform
 */
export function getModifierKey(): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? 'Cmd' : 'Ctrl'
}
