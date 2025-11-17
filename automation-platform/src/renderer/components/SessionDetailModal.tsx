import React, { useState, useEffect } from 'react'
import type { Session } from '../../shared/types'

interface SessionDetailModalProps {
  isOpen: boolean
  session: Session | null
  onClose: () => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onComplete: (outcome: 'success' | 'partial' | 'blocked' | 'abandoned', notes: string) => void
  onUpdateNotes: (notes: string) => void
}

export function SessionDetailModal({
  isOpen,
  session,
  onClose,
  onStart,
  onPause,
  onResume,
  onComplete,
  onUpdateNotes
}: SessionDetailModalProps) {
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [outcome, setOutcome] = useState<'success' | 'partial' | 'blocked' | 'abandoned'>('success')
  const [finalNotes, setFinalNotes] = useState('')
  const [currentDuration, setCurrentDuration] = useState(0)

  useEffect(() => {
    if (session) {
      setNotes(session.notes || '')
      setCurrentDuration(session.duration || 0)
    }
  }, [session])

  // Live timer
  useEffect(() => {
    if (!session || session.status !== 'in_progress' || !session.startedAt) {
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - session.startedAt!
      setCurrentDuration((session.duration || 0) + elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.status, session?.startedAt, session?.duration])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusBadge = () => {
    if (!session) return null

    const colors = {
      planning: 'bg-blue-500',
      in_progress: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-gray-500',
      blocked: 'bg-red-500',
      abandoned: 'bg-gray-400'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${colors[session.status]}`}>
        {session.status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getOutcomeBadge = () => {
    if (!session?.outcome) return null

    const colors = {
      success: 'bg-green-500',
      partial: 'bg-yellow-500',
      blocked: 'bg-red-500',
      abandoned: 'bg-gray-400'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${colors[session.outcome]}`}>
        {session.outcome.toUpperCase()}
      </span>
    )
  }

  const handleSaveNotes = () => {
    onUpdateNotes(notes)
    setIsEditingNotes(false)
  }

  const handleCompleteSubmit = () => {
    onComplete(outcome, finalNotes)
    setShowCompleteForm(false)
  }

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{session.name}</h2>
            <p className="text-gray-600 mt-1">{session.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status and Outcome */}
        <div className="flex gap-3 mb-6">
          {getStatusBadge()}
          {getOutcomeBadge()}
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {session.goal && (
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-700">Goal:</span>
              <p className="text-gray-900">{session.goal}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700">Created:</span>
            <p className="text-gray-900">{formatDate(session.createdAt)}</p>
          </div>
          {session.startedAt && (
            <div>
              <span className="text-sm font-medium text-gray-700">Started:</span>
              <p className="text-gray-900">{formatDate(session.startedAt)}</p>
            </div>
          )}
          {session.completedAt && (
            <div>
              <span className="text-sm font-medium text-gray-700">Completed:</span>
              <p className="text-gray-900">{formatDate(session.completedAt)}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700">Duration:</span>
            <p className={`text-gray-900 ${session.status === 'in_progress' ? 'text-green-600 font-semibold' : ''}`}>
              {formatDuration(currentDuration)}
            </p>
          </div>
          {session.branchName && (
            <div>
              <span className="text-sm font-medium text-gray-700">Branch:</span>
              <p className="text-gray-900 font-mono text-sm">{session.branchName}</p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Notes</h3>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingNotes ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Add session notes (markdown supported)..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNotes(session.notes || '')
                    setIsEditingNotes(false)
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
              {session.notes || 'No notes yet'}
            </div>
          )}
        </div>

        {/* Test Runs Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Linked Test Runs</h3>
          {session.testRunIds.length > 0 ? (
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-600">
                {session.testRunIds.length} test run(s) linked
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                {session.testRunIds.map(id => (
                  <li key={id} className="font-mono">{id}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No test runs linked yet</p>
          )}
        </div>

        {/* Commits Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Linked Commits</h3>
          {session.commitShas.length > 0 ? (
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-600">
                {session.commitShas.length} commit(s) linked
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                {session.commitShas.map(sha => (
                  <li key={sha} className="font-mono">{sha.substring(0, 7)}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No commits linked yet</p>
          )}
        </div>

        {/* Complete Form */}
        {showCompleteForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Complete Session</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="success">Success</option>
                  <option value="partial">Partial</option>
                  <option value="blocked">Blocked</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Final Notes</label>
                <textarea
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Summary of what was accomplished..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCompleteSubmit}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Confirm Complete
                </button>
                <button
                  onClick={() => setShowCompleteForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end border-t pt-4">
          {session.status === 'planning' && (
            <button
              onClick={onStart}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Start Session
            </button>
          )}
          {session.status === 'in_progress' && (
            <>
              <button
                onClick={onPause}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Pause
              </button>
              <button
                onClick={() => setShowCompleteForm(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Complete
              </button>
            </>
          )}
          {session.status === 'paused' && (
            <>
              <button
                onClick={onResume}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resume
              </button>
              <button
                onClick={() => setShowCompleteForm(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Complete
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
