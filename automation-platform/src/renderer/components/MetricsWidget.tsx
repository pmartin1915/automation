import React, { useEffect, useState } from 'react'
import type { SuccessMetrics } from '../../shared/types'

interface MetricsWidgetProps {
  projectId?: string  // If provided, show only this project's metrics
}

export function MetricsWidget({ projectId }: MetricsWidgetProps) {
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [projectId])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const result = await window.electronAPI.activity.getMetrics(projectId)

      if (result.success) {
        setMetrics(result.metrics)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuccessRateBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-100'
    if (rate >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatDuration = (ms: number) => {
    if (ms === 0) return 'N/A'
    const minutes = Math.floor(ms / (1000 * 60))
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading metrics...</div>
        </div>
      </div>
    )
  }

  if (!metrics || metrics.totalSessions === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No completed sessions yet</p>
          <p className="text-sm text-gray-400 mt-1">Metrics will appear after completing work sessions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Success Metrics</h3>
          <button
            onClick={loadMetrics}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="p-6">
        {/* Overall Success Rate - Featured */}
        <div className={`${getSuccessRateBg(metrics.successRate)} rounded-lg p-6 mb-6`}>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Overall Success Rate</div>
            <div className={`text-5xl font-bold ${getSuccessRateColor(metrics.successRate)}`}>
              {Math.round(metrics.successRate)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {metrics.successfulSessions} of {metrics.completedSessions} sessions successful
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Sessions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.completedSessions}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Success Rates by Type */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Success by Template Type</h4>
          <div className="space-y-3">
            {/* Fix Tests */}
            {metrics.testFixSuccessRate > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fix Tests</span>
                  <span className={`font-medium ${getSuccessRateColor(metrics.testFixSuccessRate)}`}>
                    {Math.round(metrics.testFixSuccessRate)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metrics.testFixSuccessRate >= 80 ? 'bg-green-500' :
                      metrics.testFixSuccessRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.testFixSuccessRate}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Add Feature */}
            {metrics.featureAddSuccessRate > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Add Feature</span>
                  <span className={`font-medium ${getSuccessRateColor(metrics.featureAddSuccessRate)}`}>
                    {Math.round(metrics.featureAddSuccessRate)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metrics.featureAddSuccessRate >= 80 ? 'bg-green-500' :
                      metrics.featureAddSuccessRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.featureAddSuccessRate}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Refactor */}
            {metrics.refactorSuccessRate > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Refactor</span>
                  <span className={`font-medium ${getSuccessRateColor(metrics.refactorSuccessRate)}`}>
                    {Math.round(metrics.refactorSuccessRate)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metrics.refactorSuccessRate >= 80 ? 'bg-green-500' :
                      metrics.refactorSuccessRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.refactorSuccessRate}%` }}
                  ></div>
                </div>
              </div>
            )}

            {metrics.testFixSuccessRate === 0 && metrics.featureAddSuccessRate === 0 && metrics.refactorSuccessRate === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                No template-specific data yet
              </div>
            )}
          </div>
        </div>

        {/* Average Duration */}
        {metrics.avgDuration > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Avg. Session Duration</div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {formatDuration(metrics.avgDuration)}
                </div>
              </div>
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
