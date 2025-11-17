import { ipcMain, BrowserWindow, shell } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import { getProjectManager } from './services/ProjectManager'
import { getConfigStore } from './services/ConfigStore'
import { getTestRunner } from './services/TestRunner'
import { getFileWatcher } from './services/FileWatcher'
import { gitService } from './services/GitService'
import { SessionService } from './services/SessionService'
import { contextBuilder } from './services/ContextBuilder'
import { ActivityService } from './services/ActivityService'

let projectManager: ReturnType<typeof getProjectManager>
let configStore: ReturnType<typeof getConfigStore>
let testRunner: ReturnType<typeof getTestRunner>
let fileWatcher: ReturnType<typeof getFileWatcher>
let sessionService: SessionService
let activityService: ActivityService

export function setupIpcHandlers() {
  projectManager = getProjectManager()
  configStore = getConfigStore()
  testRunner = getTestRunner()
  fileWatcher = getFileWatcher()
  sessionService = SessionService.getInstance()
  activityService = ActivityService.getInstance()

  // Initialize services
  sessionService.initialize()
  activityService.initialize()

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

  ipcMain.handle(IPC_CHANNELS.PROJECT_ANALYZE_FOLDER, async (_event, folderPath) => {
    return await projectManager.analyzeFolder(folderPath)
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
    try {
      const status = await gitService.getStatus(projectPath)
      return status
    } catch (error: any) {
      console.error('Error getting git status:', error)
      return null
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_COMMIT, async (_event, { projectPath, message, files }) => {
    try {
      const success = await gitService.commit(projectPath, message, files)

      // Log activity
      if (success) {
        const projects = projectManager.getAllProjects()
        const project = projects.find(p => p.path === projectPath)
        if (project) {
          // Get the commit SHA from git log
          const status = await gitService.getStatus(projectPath)
          await activityService.onCommit(project.id, project.name, 'HEAD', message)
        }
      }

      return { success }
    } catch (error: any) {
      console.error('Error committing:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_PUSH, async (_event, { projectPath, remote, branch }) => {
    try {
      const success = await gitService.push(projectPath, remote, branch)
      return { success }
    } catch (error: any) {
      console.error('Error pushing:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_PULL, async (_event, { projectPath, remote, branch }) => {
    try {
      const success = await gitService.pull(projectPath, remote, branch)
      return { success }
    } catch (error: any) {
      console.error('Error pulling:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_CREATE_BRANCH, async (_event, { projectPath, branchName, checkout }) => {
    try {
      const success = await gitService.createBranch(projectPath, branchName, checkout)
      return { success }
    } catch (error: any) {
      console.error('Error creating branch:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_SWITCH_BRANCH, async (_event, { projectPath, branchName }) => {
    try {
      const success = await gitService.switchBranch(projectPath, branchName)
      return { success }
    } catch (error: any) {
      console.error('Error switching branch:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCHES, async (_event, projectPath) => {
    try {
      const branches = await gitService.getBranches(projectPath)
      return branches
    } catch (error: any) {
      console.error('Error getting branches:', error)
      return { local: [], remote: [], current: '' }
    }
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
  ipcMain.handle(IPC_CHANNELS.SESSION_CREATE, async (_event, sessionData) => {
    try {
      const session = await sessionService.createSession(sessionData)

      // Log activity
      const project = projectManager.getProject(session.projectId)
      if (project) {
        await activityService.onSessionCreated(session, project.name)
      }

      return { success: true, session }
    } catch (error: any) {
      console.error('Error creating session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_ALL, async () => {
    try {
      const sessions = await sessionService.getAllSessions()
      return { success: true, sessions }
    } catch (error: any) {
      console.error('Error getting sessions:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_BY_ID, async (_event, sessionId) => {
    try {
      const session = await sessionService.getSessionById(sessionId)
      return { success: true, session }
    } catch (error: any) {
      console.error('Error getting session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_UPDATE, async (_event, { id, updates }) => {
    try {
      const session = await sessionService.updateSession(id, updates)
      return { success: true, session }
    } catch (error: any) {
      console.error('Error updating session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_DELETE, async (_event, sessionId) => {
    try {
      const deleted = await sessionService.deleteSession(sessionId)
      return { success: deleted }
    } catch (error: any) {
      console.error('Error deleting session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_START, async (_event, sessionId) => {
    try {
      const session = await sessionService.startSession(sessionId)

      // Log activity
      const project = projectManager.getProject(session.projectId)
      if (project) {
        await activityService.onSessionStarted(session, project.name)
      }

      return { success: true, session }
    } catch (error: any) {
      console.error('Error starting session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_PAUSE, async (_event, sessionId) => {
    try {
      const session = await sessionService.pauseSession(sessionId)
      return { success: true, session }
    } catch (error: any) {
      console.error('Error pausing session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_RESUME, async (_event, sessionId) => {
    try {
      const session = await sessionService.resumeSession(sessionId)
      return { success: true, session }
    } catch (error: any) {
      console.error('Error resuming session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_COMPLETE, async (_event, { id, outcome, notes }) => {
    try {
      const session = await sessionService.completeSession(id, outcome, notes)

      // Log activity
      const project = projectManager.getProject(session.projectId)
      if (project) {
        await activityService.onSessionCompleted(session, project.name)
      }

      return { success: true, session }
    } catch (error: any) {
      console.error('Error completing session:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_BY_PROJECT, async (_event, projectId) => {
    try {
      const sessions = await sessionService.getSessionsByProject(projectId)
      return { success: true, sessions }
    } catch (error: any) {
      console.error('Error getting sessions by project:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_GET_ANALYTICS, async (_event, projectId) => {
    try {
      const analytics = await sessionService.getSessionAnalytics(projectId)
      return { success: true, analytics }
    } catch (error: any) {
      console.error('Error getting session analytics:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_LINK_TEST_RUN, async (_event, { sessionId, testRunId }) => {
    try {
      const linked = await sessionService.linkTestRun(sessionId, testRunId)
      return { success: linked }
    } catch (error: any) {
      console.error('Error linking test run:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.SESSION_LINK_COMMIT, async (_event, { sessionId, commitSha }) => {
    try {
      const linked = await sessionService.linkCommit(sessionId, commitSha)
      return { success: linked }
    } catch (error: any) {
      console.error('Error linking commit:', error)
      return { success: false, error: error.message }
    }
  })

  // Context handlers (Week 7)
  ipcMain.handle(IPC_CHANNELS.CONTEXT_GET_TEMPLATES, async () => {
    try {
      const templates = contextBuilder.getTemplates()
      return { success: true, templates }
    } catch (error: any) {
      console.error('Error getting context templates:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONTEXT_GENERATE, async (_event, { projectId, templateId, options }) => {
    try {
      const project = projectManager.getProject(projectId)
      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      const context = await contextBuilder.generateContext(project, templateId, options)
      return { success: true, context }
    } catch (error: any) {
      console.error('Error generating context:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONTEXT_OPEN_EXTERNAL, async (_event, url) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error: any) {
      console.error('Error opening external URL:', error)
      return { success: false, error: error.message }
    }
  })

  // Activity handlers (Week 8)
  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_BY_PROJECT, async (_event, { projectId, limit }) => {
    try {
      const activities = await activityService.getActivitiesByProject(projectId, limit)
      return { success: true, activities }
    } catch (error: any) {
      console.error('Error getting project activities:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_GLOBAL, async (_event, limit) => {
    try {
      const activities = await activityService.getGlobalFeed(limit)
      return { success: true, activities }
    } catch (error: any) {
      console.error('Error getting global activity feed:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_METRICS, async (_event, projectId) => {
    try {
      const metrics = await activityService.getSuccessMetrics(projectId)
      return { success: true, metrics }
    } catch (error: any) {
      console.error('Error getting success metrics:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.ACTIVITY_LOG, async (_event, activity) => {
    try {
      const newActivity = await activityService.logActivity(activity)
      return { success: true, activity: newActivity }
    } catch (error: any) {
      console.error('Error logging activity:', error)
      return { success: false, error: error.message }
    }
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

  testRunner.on('test:complete', async (data) => {
    sendToRenderer(IPC_CHANNELS.TEST_COMPLETE, data)

    // Log activity
    try {
      const project = projectManager.getProject(data.projectId)
      if (project && data.results) {
        await activityService.onTestComplete(data.projectId, project.name, data.results)
      }
    } catch (error) {
      console.error('Error logging test complete activity:', error)
    }
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
