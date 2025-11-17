import { create } from 'zustand'
import type { Project, TestFile, Session } from '../../shared/types'

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

  // Sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),

  // UI state
  theme: 'auto',
  setTheme: (theme) => set({ theme }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
