import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import type { AppConfig, Project } from '../../shared/types'

export class ConfigStore {
  private configDir: string
  private configPath: string
  private config: AppConfig | null = null

  constructor() {
    // Store config in user's home directory
    this.configDir = path.join(app.getPath('home'), '.claude-automation')
    this.configPath = path.join(this.configDir, 'config.json')
  }

  /**
   * Load configuration from disk
   */
  async load(): Promise<AppConfig> {
    try {
      // Create config directory if it doesn't exist
      await fs.mkdir(this.configDir, { recursive: true })

      // Try to read existing config
      const data = await fs.readFile(this.configPath, 'utf-8')
      this.config = JSON.parse(data)
      console.log('Config loaded:', this.configPath)
      return this.config!
    } catch (error: any) {
      // If file doesn't exist, create default config
      if (error.code === 'ENOENT') {
        console.log('No config found, creating default...')
        this.config = this.getDefaultConfig()
        await this.save()
        return this.config
      }
      throw error
    }
  }

  /**
   * Save configuration to disk
   */
  async save(): Promise<void> {
    if (!this.config) {
      throw new Error('No config to save')
    }

    try {
      await fs.mkdir(this.configDir, { recursive: true })
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf-8'
      )
      console.log('Config saved:', this.configPath)
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }

  /**
   * Get current configuration
   */
  get(): AppConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    return this.config
  }

  /**
   * Update configuration
   */
  update(updates: Partial<AppConfig>): void {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    this.config = { ...this.config, ...updates }
  }

  /**
   * Add a project to the configuration
   */
  addProject(project: Project): void {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    // Check if project already exists
    const exists = this.config.projects.some((p) => p.id === project.id)
    if (exists) {
      throw new Error(`Project with id ${project.id} already exists`)
    }
    this.config.projects.push(project)
  }

  /**
   * Update a project in the configuration
   */
  updateProject(project: Project): void {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    const index = this.config.projects.findIndex((p) => p.id === project.id)
    if (index === -1) {
      throw new Error(`Project with id ${project.id} not found`)
    }
    this.config.projects[index] = project
  }

  /**
   * Remove a project from the configuration
   */
  removeProject(projectId: string): void {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    this.config.projects = this.config.projects.filter((p) => p.id !== projectId)
  }

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    return this.config.projects
  }

  /**
   * Get a specific project by ID
   */
  getProject(projectId: string): Project | undefined {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.')
    }
    return this.config.projects.find((p) => p.id === projectId)
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      projects: [],
      theme: 'auto',
      gitAutoPush: false,
      branchNamingPattern: 'claude/{task}-v1',
      sessionAutoPause: false,
      sessionIdleTimeout: 15,
      sessionAutoLink: true
    }
  }
}

// Singleton instance
let configStoreInstance: ConfigStore | null = null

export function getConfigStore(): ConfigStore {
  if (!configStoreInstance) {
    configStoreInstance = new ConfigStore()
  }
  return configStoreInstance
}
