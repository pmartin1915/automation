import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Project, ContextTemplate, TestSuiteResult, GitStatus } from '../../shared/types'

interface ContextPreviewModalProps {
  project: Project
  onClose: () => void
  testResults?: TestSuiteResult
  gitStatus?: GitStatus
}

export function ContextPreviewModal({
  project,
  onClose,
  testResults,
  gitStatus
}: ContextPreviewModalProps) {
  const [templates, setTemplates] = useState<ContextTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('fix-tests')
  const [generatedContext, setGeneratedContext] = useState<string>('')
  const [editedContext, setEditedContext] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')
  const [createSession, setCreateSession] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    generateContext()
  }, [selectedTemplate, project.id])

  const loadTemplates = async () => {
    try {
      if (!window.electronAPI) return

      const response = await window.electronAPI.context.getTemplates()
      if (response.success && response.templates) {
        setTemplates(response.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const generateContext = async () => {
    setLoading(true)
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available')
      }

      const options = {
        testResults,
        gitStatus
      }

      const response = await window.electronAPI.context.generate(
        project.id,
        selectedTemplate,
        options
      )

      if (response.success && response.context) {
        setGeneratedContext(response.context)
        setEditedContext(response.context)
      } else {
        toast.error(response.error || 'Failed to generate context')
      }
    } catch (error: any) {
      console.error('Error generating context:', error)
      toast.error('Failed to generate context')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      const contextToCopy = viewMode === 'edit' ? editedContext : generatedContext
      await navigator.clipboard.writeText(contextToCopy)
      toast.success('Context copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleOpenClaude = async () => {
    try {
      const contextToCopy = viewMode === 'edit' ? editedContext : generatedContext

      // Copy to clipboard first
      await navigator.clipboard.writeText(contextToCopy)

      // Open Claude Code in browser
      if (window.electronAPI) {
        await window.electronAPI.context.openExternal('https://claude.ai')
        toast.success('Context copied! Opening Claude Code...')
      }
    } catch (error) {
      console.error('Error opening Claude Code:', error)
      toast.error('Failed to open Claude Code')
    }
  }

  const handleRegenerate = () => {
    generateContext()
    setViewMode('preview')
  }

  const currentTemplate = templates.find(t => t.id === selectedTemplate)
  const displayContext = viewMode === 'edit' ? editedContext : generatedContext

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">Claude Code Context</h2>
              <p className="text-sm text-muted-foreground">{project.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition"
            >
              ✕
            </button>
          </div>

          {/* Template Selector */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium">Template:</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="px-3 py-2 text-sm border border-border rounded-md hover:bg-accent transition disabled:opacity-50"
            >
              {loading ? '⏳ Generating...' : '🔄 Regenerate'}
            </button>
          </div>

          {currentTemplate && (
            <p className="mt-2 text-sm text-muted-foreground">
              {currentTemplate.description}
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                viewMode === 'preview'
                  ? 'bg-background border-t border-l border-r border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📄 Preview
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                viewMode === 'edit'
                  ? 'bg-background border-t border-l border-r border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✏️ Edit
            </button>
          </div>
        </div>

        {/* Context Display */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-muted-foreground">Generating context...</p>
              </div>
            </div>
          ) : viewMode === 'preview' ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="bg-black/50 rounded-lg p-4 text-xs overflow-auto whitespace-pre-wrap font-mono">
                {displayContext}
              </pre>
            </div>
          ) : (
            <textarea
              value={editedContext}
              onChange={(e) => setEditedContext(e.target.value)}
              className="w-full h-full px-4 py-3 bg-black/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs resize-none"
              placeholder="Edit context here..."
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createSession"
                checked={createSession}
                onChange={(e) => setCreateSession(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="createSession" className="text-sm text-muted-foreground">
                Create new session for this task
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition"
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={handleOpenClaude}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:opacity-90 transition font-medium"
              >
                🤖 Open Claude Code
              </button>
            </div>
          </div>

          {createSession && (
            <div className="mt-4 p-3 bg-accent/50 border border-border rounded-md">
              <p className="text-sm text-muted-foreground">
                💡 Session creation will be implemented in the next step
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
