import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type { Project, GitStatus, Session, AppConfig, TestSuiteResult } from '../shared/types'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
const api = {
  // Project operations
  projects: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_GET_ALL),
    get: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_GET, projectId),
    add: (project: Partial<Project>) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_ADD, project),
    update: (project: Project) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_UPDATE, project),
    remove: (projectId: string) => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_REMOVE, projectId)
  },

  // Test operations
  tests: {
    run: (projectId: string, testFile?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEST_RUN, { projectId, testFile }),
    runAll: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEST_RUN_ALL, projectId),
    onOutput: (callback: (data: { projectId: string; output: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_OUTPUT, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_OUTPUT, listener)
    },
    onComplete: (callback: (result: TestSuiteResult) => void) => {
      const listener = (_event: any, result: any) => callback(result)
      ipcRenderer.on(IPC_CHANNELS.TEST_COMPLETE, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_COMPLETE, listener)
    }
  },

  // Git operations
  git: {
    status: (projectPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_STATUS, projectPath),
    commit: (projectPath: string, message: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, { projectPath, message }),
    push: (projectPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_PUSH, projectPath),
    pull: (projectPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_PULL, projectPath),
    createBranch: (projectPath: string, branchName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_BRANCH, { projectPath, branchName }),
    switchBranch: (projectPath: string, branchName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_SWITCH_BRANCH, { projectPath, branchName }),
    getBranches: (projectPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_BRANCHES, projectPath)
  },

  // Session operations
  sessions: {
    create: (session: Partial<Session>) =>
      ipcRenderer.invoke(IPC_CHANNELS.SESSION_CREATE, session),
    getAll: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SESSION_GET_ALL, projectId),
    update: (session: Session) =>
      ipcRenderer.invoke(IPC_CHANNELS.SESSION_UPDATE, session)
  },

  // Config operations
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET),
    update: (config: Partial<AppConfig>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIG_UPDATE, config)
  }
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api)

// Type declaration for the global window object
export type ElectronAPI = typeof api
