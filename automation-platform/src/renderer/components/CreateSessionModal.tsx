import React, { useState, useEffect } from 'react'
import type { Project } from '../../shared/types'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  preselectedProjectId?: string
  onCreate: (sessionData: {
    name: string
    description: string
    goal?: string
    projectId: string
    branchName?: string
    status: 'planning'
    notes: string
  }, createBranch: boolean) => void
}

export function CreateSessionModal({
  isOpen,
  onClose,
  projects,
  preselectedProjectId,
  onCreate
}: CreateSessionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [projectId, setProjectId] = useState(preselectedProjectId || '')
  const [createBranch, setCreateBranch] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [linkExisting, setLinkExisting] = useState(false)
  const [existingBranches, setExistingBranches] = useState<string[]>([])

  useEffect(() => {
    if (preselectedProjectId) {
      setProjectId(preselectedProjectId)
    }
  }, [preselectedProjectId])

  // Auto-generate branch name from session name
  useEffect(() => {
    if (name && createBranch) {
      const sanitized = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setBranchName(`session/${sanitized}`)
    }
  }, [name, createBranch])

  // Load branches for selected project
  useEffect(() => {
    if (projectId && linkExisting) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        window.electronAPI.git.getBranches(project.path).then(result => {
          setExistingBranches(result.local || [])
        })
      }
    }
  }, [projectId, linkExisting, projects])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const sessionData = {
      name,
      description,
      goal: goal || undefined,
      projectId,
      branchName: linkExisting ? branchName : (createBranch ? branchName : undefined),
      status: 'planning' as const,
      notes: ''
    }

    onCreate(sessionData, createBranch)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setGoal('')
    setProjectId(preselectedProjectId || '')
    setCreateBranch(false)
    setBranchName('')
    setLinkExisting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Session</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Implement user authentication"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Brief description of what you'll work on"
                required
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal (Optional)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., All tests passing, feature complete"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Git Branch Options */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createBranch}
                    onChange={(e) => {
                      setCreateBranch(e.target.checked)
                      if (e.target.checked) setLinkExisting(false)
                    }}
                    className="rounded text-blue-500"
                  />
                  <span className="text-sm font-medium">Create Git branch for this session</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={linkExisting}
                    onChange={(e) => {
                      setLinkExisting(e.target.checked)
                      if (e.target.checked) setCreateBranch(false)
                    }}
                    className="rounded text-blue-500"
                  />
                  <span className="text-sm font-medium">Link to existing branch</span>
                </label>
              </div>

              {createBranch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="session/feature-name"
                  />
                </div>
              )}

              {linkExisting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Branch
                  </label>
                  <select
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a branch</option>
                    {existingBranches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
