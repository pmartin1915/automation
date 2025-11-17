import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import { Sessions } from './pages/Sessions'
import { Settings } from './pages/Settings'
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'sessions' | 'settings'>('dashboard')
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Define global keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: '1',
      ctrlOrCmd: true,
      action: () => setCurrentPage('dashboard'),
      description: 'Go to Dashboard',
      category: 'Navigation',
    },
    {
      key: '2',
      ctrlOrCmd: true,
      action: () => setCurrentPage('sessions'),
      description: 'Go to Sessions',
      category: 'Navigation',
    },
    {
      key: '3',
      ctrlOrCmd: true,
      action: () => setCurrentPage('settings'),
      description: 'Go to Settings',
      category: 'Navigation',
    },
    {
      key: ',',
      ctrlOrCmd: true,
      action: () => setCurrentPage('settings'),
      description: 'Open Settings',
      category: 'Navigation',
    },
    // Help
    {
      key: '/',
      ctrlOrCmd: true,
      action: () => setShowShortcutsModal(true),
      description: 'Show Keyboard Shortcuts',
      category: 'Help',
    },
    {
      key: 'Escape',
      action: () => setShowShortcutsModal(false),
      description: 'Close Modal',
      category: 'General',
    },
  ]

  // Register keyboard shortcuts
  useKeyboardShortcuts({ shortcuts })

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🚂</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Automation Station
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Your AI Development Hub</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1 px-2 py-1 rounded hover:bg-accent"
            title="View keyboard shortcuts"
          >
            <span>⌨️</span>
            <span>Shortcuts</span>
          </button>
          <span className="text-sm text-muted-foreground">v1.0.0</span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card p-6">
          <nav className="space-y-1.5">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 font-medium ${
                currentPage === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'hover:bg-accent hover:translate-x-1'
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('sessions')}
              className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 font-medium ${
                currentPage === 'sessions'
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'hover:bg-accent hover:translate-x-1'
              }`}
            >
              <span className="text-lg">📝</span>
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-full px-4 py-3 text-left rounded-lg transition-all duration-200 flex items-center gap-3 font-medium ${
                currentPage === 'settings'
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'hover:bg-accent hover:translate-x-1'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </button>
          </nav>

          {/* Add Project Button */}
          <div className="mt-8">
            <button className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-all duration-200 text-sm font-medium hover:shadow-md hover:scale-105 group">
              <span className="text-primary group-hover:scale-110 inline-block transition-transform">+</span> Add Project
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'sessions' && <Sessions />}
          {currentPage === 'settings' && <Settings />}
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal
          shortcuts={shortcuts}
          onClose={() => setShowShortcutsModal(false)}
        />
      )}
    </div>
  )
}

export default App
