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
      case 'planning': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
      case 'in_progress': return 'bg-green-500/10 text-green-600 border border-green-500/20 animate-pulse'
      case 'paused': return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
      case 'completed': return 'bg-muted text-muted-foreground border border-border'
      case 'blocked': return 'bg-red-500/10 text-red-600 border border-red-500/20'
      case 'abandoned': return 'bg-muted text-muted-foreground border border-border'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  const getStatusText = () => {
    return session.status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="border border-border rounded-lg p-5 bg-card shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground text-lg">{session.name}</h4>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{session.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {session.goal && (
        <p className="text-sm text-muted-foreground mb-3 mt-2 p-2 bg-accent/50 rounded-md border-l-2 border-primary">
          <span className="font-semibold text-foreground">Goal:</span> {session.goal}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold">Duration:</span>{' '}
          <span className={session.status === 'in_progress' ? 'text-green-600 font-bold' : 'font-medium'}>
            {formatDuration(currentDuration)}
          </span>
        </div>

        <div className="flex gap-2">
          {session.status === 'in_progress' && (
            <>
              <button
                onClick={onPause}
                className="px-3 py-1.5 text-sm bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all duration-200 font-medium"
              >
                Pause
              </button>
              <button
                onClick={onComplete}
                className="px-3 py-1.5 text-sm bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all duration-200 font-medium"
              >
                Complete
              </button>
            </>
          )}

          {session.status === 'paused' && (
            <>
              <button
                onClick={onResume}
                className="px-3 py-1.5 text-sm bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all duration-200 font-medium"
              >
                Resume
              </button>
              <button
                onClick={onComplete}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200 font-medium"
              >
                Complete
              </button>
            </>
          )}

          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}
