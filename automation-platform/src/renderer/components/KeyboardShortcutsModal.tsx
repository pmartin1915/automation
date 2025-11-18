import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts'
import { KeyboardIcon } from './Icons'

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
           style={{ backgroundColor: '#0f172a' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <KeyboardIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1 text-white">Keyboard Shortcuts</h2>
                <p className="text-sm text-slate-400">
                  Master these shortcuts to speed up your workflow
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition text-2xl leading-none"
              title="Close"
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
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-800 transition"
                    >
                      <span className="text-sm text-slate-200">{shortcut.description}</span>
                      <kbd className="px-3 py-1 text-xs font-mono bg-slate-800 border border-slate-600 rounded shadow-sm text-slate-300">
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
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
