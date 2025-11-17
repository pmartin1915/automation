import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import { ContextPreviewModal } from '../components/ContextPreviewModal'
import { ActivityFeed } from '../components/ActivityFeed'
import { MetricsWidget } from '../components/MetricsWidget'
import { DropZone } from '../components/DropZone'
import { SkeletonList } from '../components/SkeletonCard'
import type { Project } from '../../shared/types'

function Dashboard() {
  const {
    projects,
    setProjects,
    testResults,
    runningTests,
    setTestRunning,
    setTestResult,
    addTestOutput,
    clearTestOutput
  } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showCommitModal, setShowCommitModal] = useState(false)
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [showContextModal, setShowContextModal] = useState(false)
  const [commitProjectId, setCommitProjectId] = useState<string | null>(null)
  const [branchProjectId, setBranchProjectId] = useState<string | null>(null)
  const [contextProjectId, setContextProjectId] = useState<string | null>(null)
  const [droppedFolderData, setDroppedFolderData] = useState<any>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    // Load projects from Electron API on mount
    loadProjects()

    // Setup test event listeners
    setupTestListeners()

    // Setup watch mode listeners
    setupWatchListeners()

    // Cleanup on unmount
    return () => {
      cleanupTestListeners()
    }
  }, [])

  const setupTestListeners = () => {
    if (!window.electronAPI) return

    // Test started
    window.electronAPI.tests.onStarted((data) => {
      setTestRunning(data.projectId, true)
      clearTestOutput(data.projectId)
    })

    // Test output
    window.electronAPI.tests.onOutput((data) => {
      addTestOutput(data.projectId, data.output)
    })

    // Test complete
    window.electronAPI.tests.onComplete((data) => {
      setTestResult(data.projectId, data.results)
      setTestRunning(data.projectId, false)

      // Show toast notification
      const project = projects.find(p => p.id === data.projectId)
      const projectName = project?.name || 'Project'

      if (data.results.failed > 0) {
        toast.error(
          `${projectName}: ${data.results.failed} test${data.results.failed > 1 ? 's' : ''} failed`,
          { duration: 5000 }
        )
      } else if (data.results.passed > 0) {
        toast.success(
          `${projectName}: All ${data.results.passed} tests passed!`,
          { duration: 4000 }
        )
      }
    })

    // Test error
    window.electronAPI.tests.onError((data) => {
      console.error('Test error:', data.error)
      setTestRunning(data.projectId, false)

      // Show error toast
      const project = projects.find(p => p.id === data.projectId)
      const projectName = project?.name || 'Project'
      toast.error(`${projectName}: Test error - ${data.error}`)
    })

    // Test killed
    window.electronAPI.tests.onKilled((data) => {
      setTestRunning(data.projectId, false)
    })
  }

  const cleanupTestListeners = () => {
    // Event listeners will be cleaned up by the preload script's removeListener
  }

  const setupWatchListeners = () => {
    if (!window.electronAPI) return

    // Watch mode started
    window.electronAPI.watch.onStarted((data) => {
      const project = projects.find(p => p.id === data.projectId)
      const projectName = project?.name || 'Project'
      toast.success(`${projectName}: Watch mode started`, { icon: '👁️' })
    })

    // Watch mode stopped
    window.electronAPI.watch.onStopped((data) => {
      const project = projects.find(p => p.id === data.projectId)
      const projectName = project?.name || 'Project'
      toast(`${projectName}: Watch mode stopped`, { icon: '⏸️' })
    })

    // Watch mode triggered
    window.electronAPI.watch.onTriggered((data) => {
      const project = projects.find(p => p.id === data.projectId)
      const projectName = project?.name || 'Project'
      const fileName = data.filePath.split('/').pop() || data.filePath
      toast(`${projectName}: File changed (${fileName})`, {
        icon: '🔄',
        duration: 3000
      })
    })
  }

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      if (window.electronAPI) {
        const loadedProjects = await window.electronAPI.projects.getAll()

        // Fetch Git status for each project
        const projectsWithGitStatus = await Promise.all(
          loadedProjects.map(async (project) => {
            try {
              const gitStatus = await window.electronAPI.git.status(project.path)
              return { ...project, gitStatus }
            } catch (error) {
              console.error(`Failed to get git status for ${project.name}:`, error)
              return project
            }
          })
        )

        setProjects(projectsWithGitStatus)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleAddProject = () => {
    setShowAddModal(true)
  }

  const handleRunTests = async (projectId: string) => {
    try {
      if (!window.electronAPI) return

      const result = await window.electronAPI.tests.runAll(projectId)
      if (!result.success) {
        console.error('Failed to run tests:', result.error)
      }
    } catch (error) {
      console.error('Error running tests:', error)
    }
  }

  const handleViewResults = (projectId: string) => {
    setSelectedProject(projectId)
  }

  const handleToggleWatch = async (project: Project) => {
    try {
      if (!window.electronAPI) return

      if (project.watchMode) {
        // Stop watching
        const result = await window.electronAPI.watch.stop(project.id)
        if (result.success) {
          // Reload projects to update state
          await loadProjects()
        } else {
          toast.error('Failed to stop watch mode')
        }
      } else {
        // Start watching
        const result = await window.electronAPI.watch.start(project.id)
        if (result.success) {
          // Reload projects to update state
          await loadProjects()
        } else {
          toast.error('Failed to start watch mode')
        }
      }
    } catch (error) {
      console.error('Error toggling watch mode:', error)
      toast.error('Error toggling watch mode')
    }
  }

  const handleCommit = (projectId: string) => {
    setCommitProjectId(projectId)
    setShowCommitModal(true)
  }

  const handleManageBranches = (projectId: string) => {
    setBranchProjectId(projectId)
    setShowBranchModal(true)
  }

  const handleLaunchClaude = (projectId: string) => {
    setContextProjectId(projectId)
    setShowContextModal(true)
  }

  const handleCopyForClaude = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const testResult = testResults.get(projectId)
    const testOutput = useStore.getState().testOutput.get(projectId) || []

    // Format test output for Claude
    let formatted = `# Test Results for ${project.name}\n\n`

    formatted += `## Project Info\n`
    formatted += `- **Path:** \`${project.path}\`\n`
    formatted += `- **Language:** ${project.language}\n`
    formatted += `- **Test Framework:** ${project.testFramework}\n\n`

    if (project.gitStatus) {
      formatted += `## Git Status\n`
      formatted += `- **Branch:** \`${project.gitStatus.branch}\`\n`
      formatted += `- **Status:** ${project.gitStatus.isDirty ? '⚠️ Uncommitted changes' : '✅ Clean'}\n`
      if (project.gitStatus.ahead > 0) {
        formatted += `- **Ahead:** ${project.gitStatus.ahead} commit(s)\n`
      }
      if (project.gitStatus.behind > 0) {
        formatted += `- **Behind:** ${project.gitStatus.behind} commit(s)\n`
      }
      formatted += `\n`
    }

    if (testResult) {
      formatted += `## Test Summary\n`
      formatted += `- **Passed:** ${testResult.passed}\n`
      formatted += `- **Failed:** ${testResult.failed}\n`
      formatted += `- **Total:** ${testResult.passed + testResult.failed}\n`
      formatted += `- **Success Rate:** ${Math.round((testResult.passed / (testResult.passed + testResult.failed)) * 100)}%\n\n`

      if (testResult.failed > 0) {
        formatted += `## ❌ Action Required\n`
        formatted += `**${testResult.failed} test(s) are failing. Please fix them.**\n\n`
      } else {
        formatted += `## ✅ All Tests Passing\n`
        formatted += `Great job! All ${testResult.passed} tests are passing.\n\n`
      }
    }

    if (testOutput.length > 0) {
      formatted += `## Test Output\n\n`
      formatted += '```\n'
      formatted += testOutput.join('')
      formatted += '\n```\n\n'
    }

    formatted += `## Task\n`
    if (testResult && testResult.failed > 0) {
      formatted += `Fix the ${testResult.failed} failing test(s) above. Review the test output and make the necessary code changes to make all tests pass.\n`
    } else {
      formatted += `Review the test results above.\n`
    }

    try {
      await navigator.clipboard.writeText(formatted)
      toast.success(`📋 Test context copied! Paste into Claude Code`, { duration: 3000 })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handlePush = async (project: Project) => {
    try {
      if (!window.electronAPI || !project.gitStatus) return

      toast.loading(`${project.name}: Pushing to remote...`)
      const result = await window.electronAPI.git.push(project.path)

      if (result.success) {
        toast.success(`${project.name}: Pushed successfully!`)
        await loadProjects()
      } else {
        toast.error(`${project.name}: Push failed - ${result.error}`)
      }
    } catch (error) {
      console.error('Error pushing:', error)
      toast.error(`${project.name}: Push error`)
    }
  }

  const handlePull = async (project: Project) => {
    try {
      if (!window.electronAPI || !project.gitStatus) return

      toast.loading(`${project.name}: Pulling from remote...`)
      const result = await window.electronAPI.git.pull(project.path)

      if (result.success) {
        toast.success(`${project.name}: Pulled successfully!`)
        await loadProjects()
      } else {
        toast.error(`${project.name}: Pull failed - ${result.error}`)
      }
    } catch (error) {
      console.error('Error pulling:', error)
      toast.error(`${project.name}: Pull error`)
    }
  }

  const handleFolderDrop = async (paths: string[]) => {
    if (!window.electronAPI || paths.length === 0) return

    // For now, only handle single folder drops
    const folderPath = paths[0]

    toast.loading('Analyzing folder...')

    try {
      const result = await window.electronAPI.projects.analyzeFolder(folderPath)

      toast.dismiss()

      if (result.valid) {
        // Show confirmation modal with detected data
        setDroppedFolderData(result)
      } else {
        toast.error(`Invalid project folder: ${result.error}`)
      }
    } catch (error) {
      toast.dismiss()
      console.error('Error analyzing folder:', error)
      toast.error('Failed to analyze folder')
    }
  }

  return (
    <DropZone onDrop={handleFolderDrop}>
      <div className="p-8">
      {/* Week 8: Activity Feed and Metrics */}
      {projects.length > 0 && (
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metrics Widget */}
          <MetricsWidget />

          {/* Activity Feed */}
          <ActivityFeed showProjectName={true} projects={projects} limit={20} />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-foreground">Projects</h2>
        <p className="text-muted-foreground text-base">
          Manage and monitor your development projects
        </p>
      </div>

      {loadingProjects ? (
        <SkeletonList count={3} />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-8xl mb-6 animate-bounce">📦</div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">No Projects Yet</h3>
          <p className="text-muted-foreground mb-8 text-lg max-w-md">
            Add your first project to get started, or drag & drop a folder here
          </p>
          <button
            onClick={handleAddProject}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            + Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="border border-border rounded-xl p-6 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl mb-2 text-foreground truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground truncate" title={project.path}>{project.path}</p>
                </div>
                <div className="text-3xl ml-3 flex-shrink-0">
                  {(() => {
                    const result = testResults.get(project.id)
                    const isRunning = runningTests.has(project.id)
                    if (isRunning) return '🔄'
                    if (!result) return '❓'
                    if (result.failed > 0) return '❌'
                    if (result.passed > 0) return '✅'
                    return '❓'
                  })()}
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm py-2 px-3 bg-accent/30 rounded-lg">
                  <span className="text-muted-foreground font-medium">Language</span>
                  <span className="font-bold text-foreground">{project.language}</span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 px-3 bg-accent/30 rounded-lg">
                  <span className="text-muted-foreground font-medium">Test Framework</span>
                  <span className="font-mono text-xs font-semibold text-foreground">{project.testFramework}</span>
                </div>

                {project.gitStatus && (
                  <div className="flex items-center justify-between text-sm py-2 px-3 bg-accent/30 rounded-lg">
                    <span className="text-muted-foreground font-medium">Branch</span>
                    <span className="font-mono text-xs font-semibold text-foreground">{project.gitStatus.branch}</span>
                  </div>
                )}

                {project.gitStatus && (
                  <div className="flex items-center justify-between text-sm py-2 px-3 bg-accent/30 rounded-lg">
                    <span className="text-muted-foreground font-medium">Git Status</span>
                    <div className="flex gap-2 items-center">
                      {project.gitStatus.isDirty && (
                        <span className="text-xs text-yellow-600 font-semibold" title="Uncommitted changes">
                          ● Dirty
                        </span>
                      )}
                      {project.gitStatus.ahead > 0 && (
                        <span className="text-xs text-blue-600 font-semibold" title={`${project.gitStatus.ahead} commits ahead`}>
                          ↑{project.gitStatus.ahead}
                        </span>
                      )}
                      {project.gitStatus.behind > 0 && (
                        <span className="text-xs text-orange-600 font-semibold" title={`${project.gitStatus.behind} commits behind`}>
                          ↓{project.gitStatus.behind}
                        </span>
                      )}
                      {!project.gitStatus.isDirty && project.gitStatus.ahead === 0 && project.gitStatus.behind === 0 && (
                        <span className="text-xs text-green-600 font-semibold" title="Clean and up to date">
                          ✓ Clean
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {testResults.get(project.id) && (
                  <div className="flex items-center justify-between text-sm py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <span className="text-green-700 font-semibold">Tests</span>
                    <span className="font-mono text-xs">
                      <span className="text-green-600 font-bold">✓ {testResults.get(project.id)!.passed}</span>
                      {testResults.get(project.id)!.failed > 0 && (
                        <span className="text-red-600 font-bold ml-2">✗ {testResults.get(project.id)!.failed}</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Watch Mode Toggle */}
                <div className="flex items-center justify-between text-sm py-2.5 px-3 bg-accent/30 rounded-lg border border-border">
                  <span className="text-muted-foreground flex items-center gap-2 font-medium">
                    {project.watchMode ? '👁️' : '⏸️'}
                    Watch Mode
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleWatch(project)
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                      project.watchMode
                        ? 'bg-green-500/20 text-green-600 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                    }`}
                  >
                    {project.watchMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                {/* Primary Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunTests(project.id)}
                    disabled={runningTests.has(project.id)}
                    className="flex-1 px-4 py-2.5 text-sm border-2 border-border rounded-lg hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:border-primary/50 hover:shadow-md"
                  >
                    {runningTests.has(project.id) ? '⏳ Running...' : '🧪 Run Tests'}
                  </button>
                  {testResults.get(project.id) && (
                    <button
                      onClick={() => handleViewResults(project.id)}
                      className="flex-1 px-4 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      📊 Results
                    </button>
                  )}
                </div>

                {/* Copy for Claude Button - Show if tests have been run */}
                {testResults.get(project.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyForClaude(project.id)
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    📋 Copy for Claude Code
                  </button>
                )}

                {/* Launch Claude Code Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLaunchClaude(project.id)
                  }}
                  className="w-full px-4 py-3 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  🚀 Launch Claude Code
                </button>

                {/* Git Actions */}
                {project.gitStatus && (
                  <div className="grid grid-cols-2 gap-2">
                    {project.gitStatus.isDirty && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCommit(project.id)
                        }}
                        className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-all duration-200 font-medium hover:border-primary/30"
                      >
                        💾 Commit
                      </button>
                    )}
                    {project.gitStatus.ahead > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePush(project)
                        }}
                        className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-all duration-200 font-medium hover:border-primary/30"
                      >
                        ⬆️ Push
                      </button>
                    )}
                    {project.gitStatus.behind > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePull(project)
                        }}
                        className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-all duration-200 font-medium hover:border-primary/30"
                      >
                        ⬇️ Pull
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleManageBranches(project.id)
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-all duration-200 font-medium hover:border-primary/30"
                    >
                      🌿 Branch
                    </button>
                  </div>
                )}
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

      {selectedProject && (
        <TestResultsModal
          projectId={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {showCommitModal && commitProjectId && (
        <CommitModal
          project={projects.find(p => p.id === commitProjectId)!}
          onClose={() => {
            setShowCommitModal(false)
            setCommitProjectId(null)
          }}
          onCommitted={loadProjects}
        />
      )}

      {showBranchModal && branchProjectId && (
        <BranchModal
          project={projects.find(p => p.id === branchProjectId)!}
          onClose={() => {
            setShowBranchModal(false)
            setBranchProjectId(null)
          }}
          onBranchChanged={loadProjects}
        />
      )}

      {showContextModal && contextProjectId && (
        <ContextPreviewModal
          project={projects.find(p => p.id === contextProjectId)!}
          testResults={testResults.get(contextProjectId)}
          gitStatus={projects.find(p => p.id === contextProjectId)?.gitStatus}
          onClose={() => {
            setShowContextModal(false)
            setContextProjectId(null)
          }}
        />
      )}

      {droppedFolderData && (
        <AddProjectFromDropModal
          folderData={droppedFolderData}
          onClose={() => setDroppedFolderData(null)}
          onProjectAdded={() => {
            setDroppedFolderData(null)
            loadProjects()
          }}
        />
      )}
    </div>
    </DropZone>
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

// Test Results Modal
function TestResultsModal({ projectId, onClose }: {
  projectId: string
  onClose: () => void
}) {
  const { projects, testResults, testOutput } = useStore()
  const project = projects.find(p => p.id === projectId)
  const result = testResults.get(projectId)
  const output = testOutput.get(projectId) || []

  if (!project) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Test Results</h2>
              <p className="text-sm text-muted-foreground">{project.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition"
            >
              ✕
            </button>
          </div>

          {/* Summary */}
          {result && (
            <div className="mt-4 flex gap-4 text-sm">
              <div className="px-3 py-2 bg-accent/50 rounded">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">{result.totalTests}</span>
              </div>
              <div className="px-3 py-2 bg-green-500/10 text-green-500 rounded">
                <span className="font-semibold">✓ {result.passed} Passed</span>
              </div>
              {result.failed > 0 && (
                <div className="px-3 py-2 bg-red-500/10 text-red-500 rounded">
                  <span className="font-semibold">✗ {result.failed} Failed</span>
                </div>
              )}
              {result.skipped > 0 && (
                <div className="px-3 py-2 bg-yellow-500/10 text-yellow-500 rounded">
                  <span className="font-semibold">○ {result.skipped} Skipped</span>
                </div>
              )}
              <div className="px-3 py-2 bg-accent/50 rounded">
                <span className="text-muted-foreground">Duration: </span>
                <span className="font-semibold">{(result.duration / 1000).toFixed(2)}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex-1 overflow-auto p-6">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Test Output</h3>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-auto">
            {output.length > 0 ? (
              output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No output available</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Commit Modal
function CommitModal({ project, onClose, onCommitted }: {
  project: Project
  onClose: () => void
  onCommitted: () => void
}) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available')
      }

      const result = await window.electronAPI.git.commit(project.path, message)

      if (result.success) {
        toast.success(`${project.name}: Changes committed`)
        onCommitted()
        onClose()
      } else {
        setError(result.error || 'Failed to commit changes')
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
        <h2 className="text-xl font-semibold mb-4">Commit Changes</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {project.name} - {project.gitStatus?.branch}
        </p>

        {project.gitStatus && (
          <div className="mb-4 text-sm space-y-1">
            {project.gitStatus.modified > 0 && (
              <div>Modified: {project.gitStatus.modified}</div>
            )}
            {project.gitStatus.untracked > 0 && (
              <div>Untracked: {project.gitStatus.untracked}</div>
            )}
            {project.gitStatus.staged > 0 && (
              <div>Staged: {project.gitStatus.staged}</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Commit Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                placeholder="Enter commit message..."
                required
              />
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
              {loading ? 'Committing...' : 'Commit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Branch Management Modal
function BranchModal({ project, onClose, onBranchChanged }: {
  project: Project
  onClose: () => void
  onBranchChanged: () => void
}) {
  const [branches, setBranches] = useState<{ local: string[], remote: string[], current: string }>({ local: [], remote: [], current: '' })
  const [newBranchName, setNewBranchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'switch' | 'create'>('switch')

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      if (window.electronAPI) {
        const branchData = await window.electronAPI.git.getBranches(project.path)
        setBranches(branchData)
      }
    } catch (err) {
      console.error('Failed to load branches:', err)
    }
  }

  const handleSwitchBranch = async (branchName: string) => {
    setError('')
    setLoading(true)

    try {
      if (!window.electronAPI) return

      const result = await window.electronAPI.git.switchBranch(project.path, branchName)

      if (result.success) {
        toast.success(`${project.name}: Switched to ${branchName}`)
        onBranchChanged()
        onClose()
      } else {
        setError(result.error || 'Failed to switch branch')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!window.electronAPI) return

      const result = await window.electronAPI.git.createBranch(project.path, newBranchName, true)

      if (result.success) {
        toast.success(`${project.name}: Created and switched to ${newBranchName}`)
        onBranchChanged()
        onClose()
      } else {
        setError(result.error || 'Failed to create branch')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Branch Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {project.name} - Current: {project.gitStatus?.branch || 'unknown'}
        </p>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border">
          <button
            onClick={() => setMode('switch')}
            className={`px-4 py-2 text-sm transition ${
              mode === 'switch'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Switch Branch
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-4 py-2 text-sm transition ${
              mode === 'create'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Branch
          </button>
        </div>

        {mode === 'switch' ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">Local Branches</h3>
            {branches.local.length > 0 ? (
              branches.local.map(branch => (
                <button
                  key={branch}
                  onClick={() => handleSwitchBranch(branch)}
                  disabled={loading || branch === branches.current}
                  className={`w-full text-left px-3 py-2 text-sm border border-border rounded hover:bg-accent transition disabled:opacity-50 ${
                    branch === branches.current ? 'bg-accent' : ''
                  }`}
                >
                  {branch} {branch === branches.current && '(current)'}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No local branches</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateBranch}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="feature/my-feature"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Branch will be created from current HEAD and checked out
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create & Switch'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 border border-border rounded-md hover:bg-accent transition"
          disabled={loading}
        >
          Close
        </button>
      </div>
    </div>
  )
}

// Add Project from Drop Modal
function AddProjectFromDropModal({ folderData, onClose, onProjectAdded }: {
  folderData: any
  onClose: () => void
  onProjectAdded: () => void
}) {
  const [name, setName] = useState(folderData.name || '')
  const [path] = useState(folderData.path || '')
  const [language, setLanguage] = useState<Project['language']>(folderData.language || 'other')
  const [testFramework, setTestFramework] = useState<Project['testFramework']>(folderData.testFramework || 'other')
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

      const result = await window.electronAPI.projects.add({
        name,
        path,
        language,
        testFramework
      })

      if (result.success) {
        toast.success(`${name}: Added successfully!`)
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
        <h2 className="text-xl font-semibold mb-4">📁 Add Project from Folder</h2>
        <p className="text-sm text-muted-foreground mb-4">
          We've detected the following project settings. You can adjust them before adding.
        </p>

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
                disabled
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Path cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Project['language'])}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Test Framework
              </label>
              <select
                value={testFramework}
                onChange={(e) => setTestFramework(e.target.value as Project['testFramework'])}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="jest">Jest</option>
                <option value="vitest">Vitest</option>
                <option value="pytest">Pytest</option>
                <option value="go-test">Go Test</option>
                <option value="cargo-test">Cargo Test</option>
                <option value="other">Other</option>
              </select>
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
