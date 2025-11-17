import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import { getProjectManager } from './services/ProjectManager'
import { getConfigStore } from './services/ConfigStore'
import { getTestRunner } from './services/TestRunner'

let projectManager: ReturnType<typeof getProjectManager>
let configStore: ReturnType<typeof getConfigStore>
let testRunner: ReturnType<typeof getTestRunner>

export function setupIpcHandlers() {
  projectManager = getProjectManager()
  configStore = getConfigStore()
  testRunner = getTestRunner()

  // Setup test runner event forwarding to renderer
  setupTestRunnerEvents()

  // Project handlers
  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_ALL, async () => {
    return projectManager.getAllProjects()
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_ADD, async (_event, projectData) => {
    return await projectManager.addProject(projectData)
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_REMOVE, async (_event, projectId) => {
    return await projectManager.removeProject(projectId)
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_GET, async (_event, projectId) => {
    const project = projectManager.getProject(projectId)
    return project || null
  })

  ipcMain.handle(IPC_CHANNELS.PROJECT_UPDATE, async (_event, project) => {
    return await projectManager.updateProject(project)
  })

  // Test handlers
  ipcMain.handle(IPC_CHANNELS.TEST_RUN, async (_event, { projectId, testFile }) => {
    return await testRunner.runTests(projectId, testFile)
  })

  ipcMain.handle(IPC_CHANNELS.TEST_RUN_ALL, async (_event, projectId) => {
    return await testRunner.runTests(projectId)
  })

  ipcMain.handle(IPC_CHANNELS.TEST_DISCOVER_FILES, async (_event, projectId) => {
    return await testRunner.discoverTestFiles(projectId)
  })

  ipcMain.handle(IPC_CHANNELS.TEST_KILL, async (_event, projectId) => {
    return { success: testRunner.killTestProcess(projectId) }
  })

  // Git handlers
  ipcMain.handle(IPC_CHANNELS.GIT_STATUS, async (_event, projectPath) => {
    // TODO: Implement
    console.log('Get git status:', projectPath)
    return null
  })

  ipcMain.handle(IPC_CHANNELS.GIT_COMMIT, async (_event, { projectPath, message }) => {
    // TODO: Implement
    console.log('Git commit:', projectPath, message)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_PUSH, async (_event, projectPath) => {
    // TODO: Implement
    console.log('Git push:', projectPath)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_PULL, async (_event, projectPath) => {
    // TODO: Implement
    console.log('Git pull:', projectPath)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_CREATE_BRANCH, async (_event, { projectPath, branchName }) => {
    // TODO: Implement
    console.log('Create branch:', projectPath, branchName)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_SWITCH_BRANCH, async (_event, { projectPath, branchName }) => {
    // TODO: Implement
    console.log('Switch branch:', projectPath, branchName)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCHES, async (_event, projectPath) => {
    // TODO: Implement
    console.log('Get branches:', projectPath)
    return []
  })

  // Config handlers
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, async () => {
    return configStore.get()
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_UPDATE, async (_event, updates) => {
    try {
      configStore.update(updates)
      await configStore.save()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Session handlers
  ipcMain.handle(IPC_CHANNELS.SESSION_CREATE, async (_event, session) => {
    // TODO: Implement
    console.log('Create session:', session)
    return { success: true, session }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_ALL, async (_event, projectId) => {
    // TODO: Implement
    console.log('Get all sessions:', projectId)
    return []
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE, async (_event, session) => {
    // TODO: Implement
    console.log('Update session:', session)
    return { success: true, session }
  })

  console.log('IPC handlers registered')
}

/**
 * Setup event forwarding from TestRunner to renderer process
 */
function setupTestRunnerEvents() {
  const sendToRenderer = (channel: string, data: any) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(window => {
      window.webContents.send(channel, data)
    })
  }

  // Forward test events to renderer
  testRunner.on('test:started', (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_STARTED, data)
  })

  testRunner.on('test:output', (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_OUTPUT, data)
  })

  testRunner.on('test:complete', (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_COMPLETE, data)
  })

  testRunner.on('test:error', (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_ERROR, data)
  })

  testRunner.on('test:killed', (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_KILLED, data)
  })

  console.log('Test runner event forwarding setup')
}
