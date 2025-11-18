import { useState, useRef, useEffect } from 'react'
import { useKeyboardShortcuts, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts'
import { KeyboardIcon } from './Icons'

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}

export function KeyboardShortcutsModal({ shortcuts, onClose }: KeyboardShortcutsModalProps) {
  const { formatShortcut } = useKeyboardShortcuts({ shortcuts: [], enabled: false })
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        style={{
          backgroundColor: '#ffffff',
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header - Draggable */}
        <div
          className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">
                <KeyboardIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1 text-gray-900">Keyboard Shortcuts</h2>
                <p className="text-sm text-gray-600">
                  Master these shortcuts to speed up your workflow
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-900 transition text-2xl leading-none"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded shadow-sm text-gray-700">
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
