import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  path: string
  testsPassing: number
  testsTotal: number
  branch: string
}

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Load projects from Electron API
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      // Mock data for now (will connect to Electron API later)
      setProjects([
        {
          id: '1',
          name: 'Clinical Toolkit',
          path: '/home/user/clinical-toolkit',
          testsPassing: 113,
          testsTotal: 113,
          branch: 'claude/mobile-app-conversion-v1'
        }
      ])
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
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
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
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
                  <span className="text-muted-foreground">Tests</span>
                  <span className={project.testsPassing === project.testsTotal ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                    {project.testsPassing}/{project.testsTotal} passing
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-mono text-xs">{project.branch}</span>
                </div>

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
    </div>
  )
}

export default Dashboard
