import { ipcMain, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import { getProjectManager } from './services/ProjectManager'
import { getConfigStore } from './services/ConfigStore'
import { getTestRunner } from './services/TestRunner'
import { getFileWatcher } from './services/FileWatcher'

let projectManager: ReturnType<typeof getProjectManager>
let configStore: ReturnType<typeof getConfigStore>
let testRunner: ReturnType<typeof getTestRunner>
let fileWatcher: ReturnType<typeof getFileWatcher>

export function setupIpcHandlers() {
  projectManager = getProjectManager()
  configStore = getConfigStore()
  testRunner = getTestRunner()
  fileWatcher = getFileWatcher()

  // Setup event forwarding to renderer
  setupTestRunnerEvents()
  setupFileWatcherEvents()

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

  // Watch mode handlers
  ipcMain.handle(IPC_CHANNELS.WATCH_START, async (_event, projectId) => {
    try {
      const project = projectManager.getProject(projectId)
      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      fileWatcher.startWatching({
        projectId: project.id,
        projectPath: project.path,
        testFramework: project.testFramework,
      })

      // Update project watch mode
      await projectManager.updateProject({ ...project, watchMode: true })

      return { success: true }
    } catch (error: any) {
      console.error('Error starting watch mode:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.WATCH_STOP, async (_event, projectId) => {
    try {
      await fileWatcher.stopWatching(projectId)

      // Update project watch mode
      const project = projectManager.getProject(projectId)
      if (project) {
        await projectManager.updateProject({ ...project, watchMode: false })
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error stopping watch mode:', error)
      return { success: false, error: error.message }
    }
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

/**
 * Setup event forwarding from FileWatcher to renderer process
 */
function setupFileWatcherEvents() {
  const sendToRenderer = (channel: string, data: any) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(window => {
      window.webContents.send(channel, data)
    })
  }

  // When files change, trigger test execution
  fileWatcher.on('change', async (data) => {
    const { projectId, filePath, eventType } = data
    console.log(`[FileWatcher] File ${eventType}: ${filePath}, triggering tests for ${projectId}`)

    // Notify renderer that watch was triggered
    sendToRenderer(IPC_CHANNELS.WATCH_TRIGGERED, { projectId, filePath, eventType })

    // Run tests for the project
    try {
      await testRunner.runTests(projectId)
    } catch (error) {
      console.error(`[FileWatcher] Error running tests for ${projectId}:`, error)
    }
  })

  // Forward watcher status events
  fileWatcher.on('ready', (data) => {
    sendToRenderer(IPC_CHANNELS.WATCH_STARTED, data)
  })

  fileWatcher.on('stopped', (data) => {
    sendToRenderer(IPC_CHANNELS.WATCH_STOPPED, data)
  })

  fileWatcher.on('error', (data) => {
    console.error('[FileWatcher] Error:', data)
  })

  console.log('File watcher event forwarding setup')
}
