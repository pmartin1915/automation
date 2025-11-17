import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { AppConfig } from '../../shared/types'

export function Settings() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const loadedConfig = await window.electronAPI.config.get()
        setConfig(loadedConfig)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (updates: Partial<AppConfig>) => {
    if (!config) return

    setSaving(true)
    try {
      const newConfig = { ...config, ...updates }
      if (window.electronAPI) {
        await window.electronAPI.config.update(newConfig)
        setConfig(newConfig)
        toast.success('Settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (theme: AppConfig['theme']) => {
    saveConfig({ theme })
  }

  const handleGitAutoPushChange = (gitAutoPush: boolean) => {
    saveConfig({ gitAutoPush })
  }

  const handleBranchNamingChange = (branchNamingPattern: string) => {
    saveConfig({ branchNamingPattern })
  }

  const handleDefaultTestCommandChange = (defaultTestCommand: string) => {
    saveConfig({ defaultTestCommand })
  }

  const handleSessionAutoPauseChange = (sessionAutoPause: boolean) => {
    saveConfig({ sessionAutoPause })
  }

  const handleSessionIdleTimeoutChange = (sessionIdleTimeout: number) => {
    saveConfig({ sessionIdleTimeout })
  }

  const handleSessionAutoLinkChange = (sessionAutoLink: boolean) => {
    saveConfig({ sessionAutoLink })
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-8">
        <div className="text-destructive">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">⚙️ Settings</h2>
        <p className="text-muted-foreground">
          Customize your automation platform experience
        </p>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <section className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">🎨 Appearance</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={config.theme}
                onChange={(e) => handleThemeChange(e.target.value as AppConfig['theme'])}
                disabled={saving}
                className="w-full max-w-xs px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Note: Theme switching will be available in a future update
              </p>
            </div>
          </div>
        </section>

        {/* Defaults */}
        <section className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">⚡ Defaults</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Test Command Template
              </label>
              <input
                type="text"
                value={config.defaultTestCommand || ''}
                onChange={(e) => handleDefaultTestCommandChange(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="npm test"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default command to use for running tests (leave empty to auto-detect)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Branch Naming Pattern
              </label>
              <input
                type="text"
                value={config.branchNamingPattern}
                onChange={(e) => handleBranchNamingChange(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="feature/"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default prefix for new branches (e.g., feature/, fix/, claude/)
              </p>
            </div>
          </div>
        </section>

        {/* Automation */}
        <section className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">🤖 Automation</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">Git Auto-Push</div>
                <div className="text-xs text-muted-foreground">
                  Automatically push commits to remote after successful local commits
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.gitAutoPush}
                  onChange={(e) => handleGitAutoPushChange(e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">Auto-Link Sessions</div>
                <div className="text-xs text-muted-foreground">
                  Automatically link test runs and commits to active sessions
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sessionAutoLink ?? true}
                  onChange={(e) => handleSessionAutoLinkChange(e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">Auto-Pause Sessions</div>
                <div className="text-xs text-muted-foreground">
                  Automatically pause sessions after a period of inactivity
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sessionAutoPause ?? false}
                  onChange={(e) => handleSessionAutoPauseChange(e.target.checked)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {config.sessionAutoPause && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Idle Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={config.sessionIdleTimeout ?? 30}
                  onChange={(e) => handleSessionIdleTimeoutChange(parseInt(e.target.value))}
                  disabled={saving}
                  className="w-full max-w-xs px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minutes of inactivity before auto-pausing a session
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Advanced */}
        <section className="border border-border rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">🔧 Advanced</h3>

          <div className="space-y-4">
            <div className="p-4 bg-accent/50 rounded-md">
              <div className="text-sm font-medium mb-2">Configuration File</div>
              <div className="text-xs text-muted-foreground mb-2">
                Settings are stored at: <code className="bg-background px-1 py-0.5 rounded">~/.claude-automation/config.json</code>
              </div>
              <button
                onClick={() => toast.success('Export feature coming soon!')}
                className="text-xs px-3 py-1.5 border border-border rounded hover:bg-accent transition"
              >
                Export Settings
              </button>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-md">
              <div className="text-sm font-medium text-destructive mb-2">Danger Zone</div>
              <div className="text-xs text-muted-foreground mb-2">
                Reset all settings to default values
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                    toast.success('Reset feature coming soon!')
                  }
                }}
                className="text-xs px-3 py-1.5 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-card border border-border rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm">Saving...</span>
          </div>
        </div>
      )}
    </div>
  )
}
