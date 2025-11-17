import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { SessionTimeline } from '../components/SessionTimeline'
import { CreateSessionModal } from '../components/CreateSessionModal'
import { SessionDetailModal } from '../components/SessionDetailModal'
import type { Session } from '../../shared/types'

export function Sessions() {
  const {
    sessions,
    projects,
    sessionAnalytics,
    selectedSession,
    setSelectedSession,
    loadSessions,
    loadSessionAnalytics,
    createSession,
    updateSession,
    startSession,
    pauseSession,
    resumeSession,
    completeSession
  } = useStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadSessions()
    loadSessionAnalytics()
  }, [loadSessions, loadSessionAnalytics])

  const handleCreateSession = async (
    sessionData: {
      name: string
      description: string
      goal?: string
      projectId: string
      branchName?: string
      status: 'planning'
      notes: string
    },
    createBranch: boolean
  ) => {
    try {
      // Create Git branch if requested
      if (createBranch && sessionData.branchName) {
        const project = projects.find(p => p.id === sessionData.projectId)
        if (project) {
          await window.electronAPI.git.createBranch(project.path, sessionData.branchName, true)
        }
      }

      // Create session
      await createSession(sessionData)

      // Reload analytics
      await loadSessionAnalytics()
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setShowDetailModal(true)
  }

  const handleStart = async () => {
    if (selectedSession) {
      await startSession(selectedSession.id)
      // Reload to get updated session
      await loadSessions()
    }
  }

  const handlePause = async () => {
    if (selectedSession) {
      await pauseSession(selectedSession.id)
      await loadSessions()
    }
  }

  const handleResume = async () => {
    if (selectedSession) {
      await resumeSession(selectedSession.id)
      await loadSessions()
    }
  }

  const handleComplete = async (outcome: 'success' | 'partial' | 'blocked' | 'abandoned', notes: string) => {
    if (selectedSession) {
      await completeSession(selectedSession.id, outcome, notes)
      await loadSessions()
      await loadSessionAnalytics()
      setShowDetailModal(false)
    }
  }

  const handleUpdateNotes = async (notes: string) => {
    if (selectedSession) {
      await updateSession(selectedSession.id, { notes })
    }
  }

  const handleExportReport = () => {
    if (!selectedSession) return

    const report = `# Session Report: ${selectedSession.name}

**Description:** ${selectedSession.description}
${selectedSession.goal ? `**Goal:** ${selectedSession.goal}` : ''}

**Status:** ${selectedSession.status}
${selectedSession.outcome ? `**Outcome:** ${selectedSession.outcome}` : ''}

**Created:** ${new Date(selectedSession.createdAt).toLocaleString()}
${selectedSession.startedAt ? `**Started:** ${new Date(selectedSession.startedAt).toLocaleString()}` : ''}
${selectedSession.completedAt ? `**Completed:** ${new Date(selectedSession.completedAt).toLocaleString()}` : ''}
${selectedSession.duration ? `**Duration:** ${Math.floor(selectedSession.duration / (1000 * 60))} minutes` : ''}

## Notes

${selectedSession.notes || 'No notes'}

## Test Runs

${selectedSession.testRunIds.length > 0 ? selectedSession.testRunIds.map(id => `- ${id}`).join('\n') : 'No test runs linked'}

## Commits

${selectedSession.commitShas.length > 0 ? selectedSession.commitShas.map(sha => `- ${sha}`).join('\n') : 'No commits linked'}
`

    // Copy to clipboard
    navigator.clipboard.writeText(report)
    alert('Session report copied to clipboard!')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground mt-2">Track your development work sessions</p>
        </div>
        <div className="flex gap-3">
          {selectedSession && (
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </button>
        </div>
      </div>

      {/* Timeline */}
      <SessionTimeline
        sessions={sessions}
        analytics={sessionAnalytics}
        projects={projects}
        onSessionClick={handleSessionClick}
      />

      {/* Create Modal */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projects={projects}
        onCreate={handleCreateSession}
      />

      {/* Detail Modal */}
      <SessionDetailModal
        isOpen={showDetailModal}
        session={selectedSession}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedSession(null)
        }}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onComplete={handleComplete}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  )
}
