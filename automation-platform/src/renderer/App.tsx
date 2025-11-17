import { useState } from 'react'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-6 bg-card">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <h1 className="text-lg font-semibold">Claude Automation Platform</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">v1.0.0</span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card p-4">
          <nav className="space-y-2">
            <button className="w-full px-4 py-2 text-left rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition">
              📊 Dashboard
            </button>
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition">
              ⚙️ Settings
            </button>
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition">
              📝 Sessions
            </button>
          </nav>

          {/* Add Project Button */}
          <div className="mt-6">
            <button className="w-full px-4 py-3 border-2 border-dashed border-border rounded-md hover:border-primary hover:bg-accent transition text-sm font-medium">
              + Add Project
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App
