import { create } from 'zustand'
import type { Project, TestFile, Session, TestSuiteResult } from '../../shared/types'

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
  setSessions: (sessions: Session[]) => void

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
  setSessions: (sessions) => set({ sessions }),

  // UI state
  theme: 'auto',
  setTheme: (theme) => set({ theme }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
