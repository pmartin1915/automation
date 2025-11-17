import { create } from 'zustand'
import type { Project, TestFile, Session, TestSuiteResult, SessionSummary } from '../../shared/types'

interface AppState {
  // Projects
  projects: Project[]
  currentProject: Project | null
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void

  // Test files
  testFiles: TestFile[]
  setTestFiles: (testFiles: TestFile[]) => void

  // Test results
  testResults: Map<string, TestSuiteResult>
  testOutput: Map<string, string[]>
  runningTests: Set<string>
  setTestResult: (projectId: string, result: TestSuiteResult) => void
  addTestOutput: (projectId: string, output: string) => void
  clearTestOutput: (projectId: string) => void
  setTestRunning: (projectId: string, running: boolean) => void
  isTestRunning: (projectId: string) => boolean

  // Sessions
  sessions: Session[]
  activeSessions: Map<string, Session>  // projectId -> active session
  selectedSession: Session | null
  sessionAnalytics: SessionSummary | null
  setSessions: (sessions: Session[]) => void
  setSelectedSession: (session: Session | null) => void
  setSessionAnalytics: (analytics: SessionSummary | null) => void
  loadSessions: () => Promise<void>
  loadSessionsByProject: (projectId: string) => Promise<void>
  createSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'testRunIds' | 'commitShas'>) => Promise<void>
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  startSession: (id: string) => Promise<void>
  pauseSession: (id: string) => Promise<void>
  resumeSession: (id: string) => Promise<void>
  completeSession: (id: string, outcome: 'success' | 'partial' | 'blocked' | 'abandoned', notes?: string) => Promise<void>
  loadSessionAnalytics: (projectId?: string) => Promise<void>
  getActiveSessionForProject: (projectId: string) => Session | null

  // UI state
  theme: 'light' | 'dark' | 'auto'
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  // Projects
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map((p) => p.id === project.id ? project : p)
  })),
  removeProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId),
    currentProject: state.currentProject?.id === projectId ? null : state.currentProject
  })),

  // Test files
  testFiles: [],
  setTestFiles: (testFiles) => set({ testFiles }),

  // Test results
  testResults: new Map(),
  testOutput: new Map(),
  runningTests: new Set(),
  setTestResult: (projectId, result) => set((state) => {
    const newResults = new Map(state.testResults)
    newResults.set(projectId, result)
    return { testResults: newResults }
  }),
  addTestOutput: (projectId, output) => set((state) => {
    const newOutput = new Map(state.testOutput)
    const existing = newOutput.get(projectId) || []
    newOutput.set(projectId, [...existing, output])
    return { testOutput: newOutput }
  }),
  clearTestOutput: (projectId) => set((state) => {
    const newOutput = new Map(state.testOutput)
    newOutput.delete(projectId)
    return { testOutput: newOutput }
  }),
  setTestRunning: (projectId, running) => set((state) => {
    const newRunning = new Set(state.runningTests)
    if (running) {
      newRunning.add(projectId)
    } else {
      newRunning.delete(projectId)
    }
    return { runningTests: newRunning }
  }),
  isTestRunning: (projectId) => {
    const state = useStore.getState()
    return state.runningTests.has(projectId)
  },

  // Sessions
  sessions: [],
  activeSessions: new Map(),
  selectedSession: null,
  sessionAnalytics: null,
  setSessions: (sessions) => {
    // Update active sessions map
    const activeMap = new Map<string, Session>()
    sessions.forEach(session => {
      if (session.status === 'in_progress' || session.status === 'paused') {
        activeMap.set(session.projectId, session)
      }
    })
    set({ sessions, activeSessions: activeMap })
  },
  setSelectedSession: (session) => set({ selectedSession: session }),
  setSessionAnalytics: (analytics) => set({ sessionAnalytics: analytics }),

  loadSessions: async () => {
    const result = await window.electronAPI.sessions.getAll()
    if (result.success && result.sessions) {
      useStore.getState().setSessions(result.sessions)
    }
  },

  loadSessionsByProject: async (projectId: string) => {
    const result = await window.electronAPI.sessions.getByProject(projectId)
    if (result.success && result.sessions) {
      // Update store with project sessions
      const allSessions = useStore.getState().sessions
      const otherSessions = allSessions.filter(s => s.projectId !== projectId)
      useStore.getState().setSessions([...otherSessions, ...result.sessions])
    }
  },

  createSession: async (sessionData) => {
    const result = await window.electronAPI.sessions.create(sessionData)
    if (result.success && result.session) {
      const sessions = [...useStore.getState().sessions, result.session]
      useStore.getState().setSessions(sessions)
    }
  },

  updateSession: async (id, updates) => {
    const result = await window.electronAPI.sessions.update(id, updates)
    if (result.success && result.session) {
      const sessions = useStore.getState().sessions.map(s =>
        s.id === id ? result.session : s
      )
      useStore.getState().setSessions(sessions)

      // Update selected session if it's the one being updated
      if (useStore.getState().selectedSession?.id === id) {
        useStore.getState().setSelectedSession(result.session)
      }
    }
  },

  deleteSession: async (id) => {
    const result = await window.electronAPI.sessions.delete(id)
    if (result.success) {
      const sessions = useStore.getState().sessions.filter(s => s.id !== id)
      useStore.getState().setSessions(sessions)

      // Clear selected session if it was deleted
      if (useStore.getState().selectedSession?.id === id) {
        useStore.getState().setSelectedSession(null)
      }
    }
  },

  startSession: async (id) => {
    const result = await window.electronAPI.sessions.start(id)
    if (result.success && result.session) {
      const sessions = useStore.getState().sessions.map(s =>
        s.id === id ? result.session : s
      )
      useStore.getState().setSessions(sessions)
    }
  },

  pauseSession: async (id) => {
    const result = await window.electronAPI.sessions.pause(id)
    if (result.success && result.session) {
      const sessions = useStore.getState().sessions.map(s =>
        s.id === id ? result.session : s
      )
      useStore.getState().setSessions(sessions)
    }
  },

  resumeSession: async (id) => {
    const result = await window.electronAPI.sessions.resume(id)
    if (result.success && result.session) {
      const sessions = useStore.getState().sessions.map(s =>
        s.id === id ? result.session : s
      )
      useStore.getState().setSessions(sessions)
    }
  },

  completeSession: async (id, outcome, notes) => {
    const result = await window.electronAPI.sessions.complete(id, outcome, notes)
    if (result.success && result.session) {
      const sessions = useStore.getState().sessions.map(s =>
        s.id === id ? result.session : s
      )
      useStore.getState().setSessions(sessions)
    }
  },

  loadSessionAnalytics: async (projectId) => {
    const result = await window.electronAPI.sessions.getAnalytics(projectId)
    if (result.success && result.analytics) {
      useStore.getState().setSessionAnalytics(result.analytics)
    }
  },

  getActiveSessionForProject: (projectId) => {
    return useStore.getState().activeSessions.get(projectId) || null
  },

  // UI state
  theme: 'auto',
  setTheme: (theme) => set({ theme }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
