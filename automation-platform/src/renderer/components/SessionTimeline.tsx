import React, { useState } from 'react'
import type { Session, SessionSummary } from '../../shared/types'

interface SessionTimelineProps {
  sessions: Session[]
  analytics: SessionSummary | null
  projects: Array<{ id: string; name: string }>
  onSessionClick: (session: Session) => void
}

export function SessionTimeline({ sessions, analytics, projects, onSessionClick }: SessionTimelineProps) {
  const [filterProject, setFilterProject] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string[]>([])

  const filteredSessions = sessions.filter(session => {
    if (filterProject && session.projectId !== filterProject) return false
    if (filterStatus.length > 0 && !filterStatus.includes(session.status)) return false
    return true
  })

  const groupedByMonth = filteredSessions.reduce((acc, session) => {
    const date = new Date(session.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'success': return 'border-green-500 bg-green-50'
      case 'partial': return 'border-yellow-500 bg-yellow-50'
      case 'blocked': return 'border-red-500 bg-red-50'
      case 'abandoned': return 'border-gray-400 bg-gray-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500'
      case 'in_progress': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-gray-500'
      case 'blocked': return 'bg-red-500'
      case 'abandoned': return 'bg-gray-400'
      default: return 'bg-gray-500'
    }
  }

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{analytics.inProgress}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">{analytics.successRate.toFixed(0)}%</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Avg Duration</div>
            <div className="text-2xl font-bold">{formatDuration(analytics.avgDuration)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-6">
          {/* Project Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Filter by Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <div className="flex gap-2 flex-wrap">
              {['planning', 'in_progress', 'paused', 'completed', 'blocked', 'abandoned'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterStatus.includes(status)
                      ? `${getStatusColor(status)} text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedByMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, monthSessions]) => {
          const [year, month] = monthKey.split('-')
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

          return (
            <div key={monthKey} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 sticky top-0 bg-gray-100 py-2 px-3 rounded-md">
                {monthName}
              </h3>

              <div className="space-y-3 pl-4">
                {monthSessions.map(session => {
                  const project = projects.find(p => p.id === session.projectId)

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className={`border-l-4 ${getOutcomeColor(session.outcome)} p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{session.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(session.status)}`}>
                              {session.status.replace('_', ' ')}
                            </span>
                            {session.outcome && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                                session.outcome === 'success' ? 'bg-green-500' :
                                session.outcome === 'partial' ? 'bg-yellow-500' :
                                session.outcome === 'blocked' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}>
                                {session.outcome}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{session.description}</p>
                          {session.goal && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Goal:</span> {session.goal}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Project: {project?.name || 'Unknown'}</span>
                            <span>Created: {formatDate(session.createdAt)}</span>
                            {session.duration && (
                              <span>Duration: {formatDuration(session.duration)}</span>
                            )}
                            {session.testRunIds.length > 0 && (
                              <span>{session.testRunIds.length} test runs</span>
                            )}
                            {session.commitShas.length > 0 && (
                              <span>{session.commitShas.length} commits</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No sessions found</p>
          </div>
        )}
      </div>
    </div>
  )
}
