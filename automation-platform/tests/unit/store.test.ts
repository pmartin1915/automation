import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@renderer/store/useStore'
import type { Project } from '@shared/types'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { setProjects } = useStore.getState()
    setProjects([])
  })

  describe('Project Management', () => {
    it('should initialize with empty projects', () => {
      const { projects } = useStore.getState()
      expect(projects).toEqual([])
    })

    it('should add projects to state', () => {
      const { setProjects, projects: initialProjects } = useStore.getState()

      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Test Project',
          path: '/test/path',
          language: 'typescript',
          testFramework: 'vitest',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      setProjects(mockProjects)

      const { projects } = useStore.getState()
      expect(projects).toHaveLength(1)
      expect(projects[0].name).toBe('Test Project')
    })

    it('should update project in state', () => {
      const { setProjects } = useStore.getState()

      const mockProject: Project[] = [
        {
          id: '1',
          name: 'Original Name',
          path: '/test/path',
          language: 'typescript',
          testFramework: 'vitest',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      setProjects(mockProject)

      // Update the project
      const updatedProjects = mockProject.map(p => ({
        ...p,
        name: 'Updated Name',
      }))

      setProjects(updatedProjects)

      const { projects } = useStore.getState()
      expect(projects[0].name).toBe('Updated Name')
    })
  })

  describe('Test Results Management', () => {
    it('should set test running state', () => {
      const { setTestRunning, runningTests } = useStore.getState()

      setTestRunning('project-1', true)

      const currentRunningTests = useStore.getState().runningTests
      expect(currentRunningTests.has('project-1')).toBe(true)
    })

    it('should clear test running state', () => {
      const { setTestRunning } = useStore.getState()

      setTestRunning('project-1', true)
      setTestRunning('project-1', false)

      const { runningTests } = useStore.getState()
      expect(runningTests.has('project-1')).toBe(false)
    })

    it('should set test results', () => {
      const { setTestResult, testResults } = useStore.getState()

      const mockResults = {
        passed: 10,
        failed: 2,
        skipped: 1,
        totalTests: 13,
        duration: 5000,
      }

      setTestResult('project-1', mockResults)

      const currentResults = useStore.getState().testResults
      expect(currentResults.get('project-1')).toEqual(mockResults)
    })

    it('should add test output', () => {
      const { addTestOutput, testOutput } = useStore.getState()

      addTestOutput('project-1', 'Test output line 1')
      addTestOutput('project-1', 'Test output line 2')

      const output = useStore.getState().testOutput.get('project-1')
      expect(output).toHaveLength(2)
      expect(output?.[0]).toBe('Test output line 1')
    })

    it('should clear test output', () => {
      const { addTestOutput, clearTestOutput } = useStore.getState()

      addTestOutput('project-1', 'Test output')
      clearTestOutput('project-1')

      const output = useStore.getState().testOutput.get('project-1')
      expect(output).toEqual([])
    })
  })

  describe('Session Management', () => {
    it('should initialize with empty sessions', () => {
      const { sessions } = useStore.getState()
      expect(sessions).toEqual([])
    })

    it('should set sessions', () => {
      const { setSessions } = useStore.getState()

      const mockSessions = [
        {
          id: '1',
          projectId: 'project-1',
          name: 'Test Session',
          description: 'Testing session management',
          status: 'planning' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          testRunIds: [],
          commitShas: [],
          notes: '',
        },
      ]

      setSessions(mockSessions)

      const { sessions } = useStore.getState()
      expect(sessions).toHaveLength(1)
      expect(sessions[0].name).toBe('Test Session')
    })

    it('should set selected session', () => {
      const { setSelectedSession, selectedSession } = useStore.getState()

      const mockSession = {
        id: '1',
        projectId: 'project-1',
        name: 'Test Session',
        description: 'Testing session management',
        status: 'planning' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        testRunIds: [],
        commitShas: [],
        notes: '',
      }

      setSelectedSession(mockSession)

      const currentSession = useStore.getState().selectedSession
      expect(currentSession?.id).toBe('1')
    })
  })
})
