import { app, BrowserWindow } from 'electron'
import path from 'path'
import { setupIpcHandlers } from './ipc-handlers'
import { getConfigStore } from './services/ConfigStore'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: 'Automation Station',
    show: false // Don't show until ready
  })

  // Setup IPC handlers
  setupIpcHandlers()

  // Load the app
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173')

    // Only open DevTools in development mode, not during tests
    if (process.env.NODE_ENV !== 'test') {
      mainWindow.webContents.openDevTools()
    }
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(async () => {
  // Load config on startup
  try {
    const configStore = getConfigStore()
    await configStore.load()
    console.log('Config loaded successfully')
  } catch (error) {
    console.error('Failed to load config:', error)
  }

  createWindow()

  app.on('activate', () => {
    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason)
})
