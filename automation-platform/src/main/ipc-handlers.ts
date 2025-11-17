import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import { getProjectManager } from './services/ProjectManager'
import { getConfigStore } from './services/ConfigStore'

let projectManager: ReturnType<typeof getProjectManager>
let configStore: ReturnType<typeof getConfigStore>

export function setupIpcHandlers() {
  projectManager = getProjectManager()
  configStore = getConfigStore()

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
    // TODO: Implement
    console.log('Run test:', projectId, testFile)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.TEST_RUN_ALL, async (_event, projectId) => {
    // TODO: Implement
    console.log('Run all tests:', projectId)
    return { success: true }
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
