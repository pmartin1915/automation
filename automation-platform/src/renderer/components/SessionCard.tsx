import React, { useState, useEffect } from 'react'
import type { Session } from '../../shared/types'

interface SessionCardProps {
  session: Session
  onPause: () => void
  onResume: () => void
  onComplete: () => void
  onViewDetails: () => void
}

export function SessionCard({ session, onPause, onResume, onComplete, onViewDetails }: SessionCardProps) {
  const [currentDuration, setCurrentDuration] = useState(session.duration || 0)

  // Live timer for in_progress sessions
  useEffect(() => {
    if (session.status !== 'in_progress' || !session.startedAt) {
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - session.startedAt!
      setCurrentDuration((session.duration || 0) + elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [session.status, session.startedAt, session.duration])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getStatusColor = () => {
    switch (session.status) {
      case 'planning': return 'bg-blue-500'
      case 'in_progress': return 'bg-green-500 animate-pulse'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-gray-500'
      case 'blocked': return 'bg-red-500'
      case 'abandoned': return 'bg-gray-400'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    return session.status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{session.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{session.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {session.goal && (
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-medium">Goal:</span> {session.goal}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Duration:</span>{' '}
          <span className={session.status === 'in_progress' ? 'text-green-600 font-semibold' : ''}>
            {formatDuration(currentDuration)}
          </span>
        </div>

        <div className="flex gap-2">
          {session.status === 'in_progress' && (
            <>
              <button
                onClick={onPause}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Complete
              </button>
            </>
          )}

          {session.status === 'paused' && (
            <>
              <button
                onClick={onResume}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Complete
              </button>
            </>
          )}

          <button
            onClick={onViewDetails}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}
