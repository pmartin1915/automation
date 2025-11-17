import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}

export function KeyboardShortcutsModal({ shortcuts, onClose }: KeyboardShortcutsModalProps) {
  const { formatShortcut } = useKeyboardShortcuts({ shortcuts: [], enabled: false })

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const categories = Object.keys(groupedShortcuts).sort()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">⌨️ Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">
                Master these shortcuts to speed up your workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-accent/50 transition"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-3 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
