import React, { useEffect, useState } from 'react'
import type { Activity, Project } from '../../shared/types'

interface ActivityFeedProps {
  projectId?: string  // If provided, show only this project's activities
  limit?: number
  showProjectName?: boolean  // Show project name in global feed
  projects?: Project[]  // For resolving project names
}

export function ActivityFeed({
  projectId,
  limit = 50,
  showProjectName = false,
  projects = []
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'session' | 'test_run' | 'commit'>('all')

  useEffect(() => {
    loadActivities()
  }, [projectId, limit])

  const loadActivities = async () => {
    try {
      setLoading(true)
      let result

      if (projectId) {
        result = await window.electronAPI.activity.getByProject(projectId, limit)
      } else {
        result = await window.electronAPI.activity.getGlobal(limit)
      }

      if (result.success) {
        setActivities(result.activities || [])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const groupActivitiesByDate = (activities: Activity[]) => {
    const now = Date.now()
    const today = new Date(now).setHours(0, 0, 0, 0)
    const yesterday = today - 24 * 60 * 60 * 1000
    const thisWeek = today - 7 * 24 * 60 * 60 * 1000

    const groups: { [key: string]: Activity[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: []
    }

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp).setHours(0, 0, 0, 0)

      if (activityDate === today) {
        groups.Today.push(activity)
      } else if (activityDate === yesterday) {
        groups.Yesterday.push(activity)
      } else if (activityDate >= thisWeek) {
        groups['This Week'].push(activity)
      } else {
        groups.Older.push(activity)
      }
    })

    return groups
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'test_run':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'commit':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
        )
      case 'file_change':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter)

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    )
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No activities yet</p>
          <p className="text-sm text-gray-400 mt-1">Start working and activities will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('session')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'session'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setFilter('test_run')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'test_run'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => setFilter('commit')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'commit'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Commits
          </button>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedActivities).map(([groupName, groupActivities]) => {
          if (groupActivities.length === 0) return null

          return (
            <div key={groupName} className="mb-6 last:mb-0">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">{groupName}</h4>
              <div className="space-y-3">
                {groupActivities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    {/* Icon */}
                    {getActivityIcon(activity.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                          )}
                          {showProjectName && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {getProjectName(activity.projectId)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Refresh button */}
      <div className="p-3 border-t border-gray-200 flex justify-center">
        <button
          onClick={loadActivities}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  )
}
