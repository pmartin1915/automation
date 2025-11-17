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
    discoverFiles: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEST_DISCOVER_FILES, projectId),
    kill: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEST_KILL, projectId),
    onStarted: (callback: (data: { projectId: string; project: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_STARTED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_STARTED, listener)
    },
    onOutput: (callback: (data: { projectId: string; output: string; type: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_OUTPUT, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_OUTPUT, listener)
    },
    onComplete: (callback: (data: { projectId: string; results: TestSuiteResult; duration: number; exitCode: number }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_COMPLETE, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_COMPLETE, listener)
    },
    onError: (callback: (data: { projectId: string; error: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_ERROR, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_ERROR, listener)
    },
    onKilled: (callback: (data: { projectId: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.TEST_KILLED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.TEST_KILLED, listener)
    }
  },

  // Watch mode operations
  watch: {
    start: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WATCH_START, projectId),
    stop: (projectId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WATCH_STOP, projectId),
    onStarted: (callback: (data: { projectId: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.WATCH_STARTED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.WATCH_STARTED, listener)
    },
    onStopped: (callback: (data: { projectId: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.WATCH_STOPPED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.WATCH_STOPPED, listener)
    },
    onTriggered: (callback: (data: { projectId: string; filePath: string; eventType: string }) => void) => {
      const listener = (_event: any, data: any) => callback(data)
      ipcRenderer.on(IPC_CHANNELS.WATCH_TRIGGERED, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.WATCH_TRIGGERED, listener)
    }
  },

  // Git operations
  git: {
    status: (projectPath: string): Promise<GitStatus | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_STATUS, projectPath),
    commit: (projectPath: string, message: string, files?: string[]): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_COMMIT, { projectPath, message, files }),
    push: (projectPath: string, remote?: string, branch?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_PUSH, { projectPath, remote, branch }),
    pull: (projectPath: string, remote?: string, branch?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_PULL, { projectPath, remote, branch }),
    createBranch: (projectPath: string, branchName: string, checkout?: boolean): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_CREATE_BRANCH, { projectPath, branchName, checkout }),
    switchBranch: (projectPath: string, branchName: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_SWITCH_BRANCH, { projectPath, branchName }),
    getBranches: (projectPath: string): Promise<{ local: string[]; remote: string[]; current: string }> =>
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
