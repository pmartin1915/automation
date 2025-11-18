import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import { Sessions } from './pages/Sessions'
import { Settings } from './pages/Settings'
import { useKeyboardShortcuts, type KeyboardShortcut } from './hooks/useKeyboardShortcuts'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import {
  TrainIcon,
  DashboardIcon,
  SessionsIcon,
  SettingsIcon,
  KeyboardIcon,
  PlusIcon
} from './components/Icons'

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
      <header className="h-16 border-b border-border/50 flex items-center px-6 bg-gradient-to-r from-card via-card to-card/95 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-blue-600 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30">
            <TrainIcon size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
              Automation Station
            </h1>
            <p className="text-xs text-muted-foreground/80 -mt-0.5 font-medium">Your AI Development Hub</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/60 hover:shadow-md"
            title="View keyboard shortcuts"
          >
            <KeyboardIcon size={16} />
            <span>Shortcuts</span>
          </button>
          <span className="text-sm text-muted-foreground/70 font-mono">v1.0.0</span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/50 bg-gradient-to-b from-card to-card/95 p-6 backdrop-blur-sm">
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full px-4 py-3.5 text-left rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold ${
                currentPage === 'dashboard'
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'hover:bg-accent/60 hover:translate-x-1 hover:shadow-md text-foreground/80 hover:text-foreground'
              }`}
            >
              <DashboardIcon size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('sessions')}
              className={`w-full px-4 py-3.5 text-left rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold ${
                currentPage === 'sessions'
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'hover:bg-accent/60 hover:translate-x-1 hover:shadow-md text-foreground/80 hover:text-foreground'
              }`}
            >
              <SessionsIcon size={20} />
              <span>Sessions</span>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-full px-4 py-3.5 text-left rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold ${
                currentPage === 'settings'
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'hover:bg-accent/60 hover:translate-x-1 hover:shadow-md text-foreground/80 hover:text-foreground'
              }`}
            >
              <SettingsIcon size={20} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Add Project Button */}
          <div className="mt-8">
            <button className="w-full px-4 py-3.5 border-2 border-dashed border-border/60 rounded-xl hover:border-primary hover:bg-accent/50 transition-all duration-200 text-sm font-semibold hover:shadow-lg hover:scale-105 group flex items-center justify-center gap-2 text-foreground/70 hover:text-foreground">
              <PlusIcon size={16} className="group-hover:scale-110 group-hover:rotate-90 transition-all duration-200" />
              <span>Add Project</span>
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
