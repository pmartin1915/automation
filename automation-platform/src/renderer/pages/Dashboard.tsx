import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import type { Project } from '../../shared/types'

function Dashboard() {
  const { projects, setProjects } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    // Load projects from Electron API on mount
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      if (window.electronAPI) {
        const loadedProjects = await window.electronAPI.projects.getAll()
        setProjects(loadedProjects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleAddProject = () => {
    setShowAddModal(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Projects</h2>
        <p className="text-muted-foreground">
          Manage and monitor your development projects
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first project to get started
          </p>
          <button
            onClick={handleAddProject}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            + Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.path}</p>
                </div>
                <div className="text-2xl">
                  {project.testsPassing === project.testsTotal ? '✅' : '⚠️'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-semibold">{project.language}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Test Framework</span>
                  <span className="font-mono text-xs">{project.testFramework}</span>
                </div>

                {project.branch && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-mono text-xs">{project.branch}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-accent transition">
                    🧪 Run Tests
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition">
                    🚀 Claude
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onProjectAdded={loadProjects}
        />
      )}
    </div>
  )
}

// Simple Add Project Modal
function AddProjectModal({ onClose, onProjectAdded }: {
  onClose: () => void
  onProjectAdded: () => void
}) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available')
      }

      const result = await window.electronAPI.projects.add({ name, path })

      if (result.success) {
        onProjectAdded()
        onClose()
      } else {
        setError(result.error || 'Failed to add project')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Project</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="My Project"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Project Path
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/home/user/my-project"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Absolute path to your project directory
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dashboard
