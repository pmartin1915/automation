import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import type { Project } from '../../shared/types'
import { getConfigStore } from './ConfigStore'

export class ProjectManager {
  private configStore = getConfigStore()

  /**
   * Validate a project path
   */
  async validateProject(projectPath: string): Promise<{
    valid: boolean
    language?: Project['language']
    testFramework?: Project['testFramework']
    error?: string
  }> {
    try {
      // Check if path exists
      const stats = await fs.stat(projectPath)
      if (!stats.isDirectory()) {
        return { valid: false, error: 'Path is not a directory' }
      }

      // Detect project type by looking for config files
      const files = await fs.readdir(projectPath)

      // JavaScript/TypeScript
      if (files.includes('package.json')) {
        const packageJson = JSON.parse(
          await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
        )

        // Detect test framework
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        }

        let testFramework: Project['testFramework'] = 'other'
        if (deps.jest) {
          testFramework = 'jest'
        } else if (deps.vitest) {
          testFramework = 'vitest'
        }

        // Detect language
        const language = files.includes('tsconfig.json') ? 'typescript' : 'javascript'

        return {
          valid: true,
          language,
          testFramework
        }
      }

      // Python
      if (files.includes('setup.py') || files.includes('pyproject.toml')) {
        return {
          valid: true,
          language: 'python',
          testFramework: 'pytest'
        }
      }

      // Go
      if (files.includes('go.mod')) {
        return {
          valid: true,
          language: 'go',
          testFramework: 'go-test'
        }
      }

      // Rust
      if (files.includes('Cargo.toml')) {
        return {
          valid: true,
          language: 'rust',
          testFramework: 'cargo-test'
        }
      }

      // Unknown project type
      return {
        valid: false,
        error: 'Could not detect project type. Expected package.json, setup.py, go.mod, or Cargo.toml'
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return { valid: false, error: 'Path does not exist' }
      }
      if (error.code === 'EACCES') {
        return { valid: false, error: 'Permission denied' }
      }
      return { valid: false, error: error.message }
    }
  }

  /**
   * Add a new project
   */
  async addProject(projectData: {
    name: string
    path: string
    testCommand?: string
  }): Promise<{ success: boolean; project?: Project; error?: string }> {
    try {
      // Validate project
      const validation = await this.validateProject(projectData.path)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Create project object
      const project: Project = {
        id: randomUUID(),
        name: projectData.name,
        path: projectData.path,
        language: validation.language || 'other',
        testFramework: validation.testFramework || 'other',
        testCommand: projectData.testCommand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to config and save
      this.configStore.addProject(project)
      await this.configStore.save()

      console.log('Project added:', project.name)
      return { success: true, project }
    } catch (error: any) {
      console.error('Failed to add project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(project: Project): Promise<{ success: boolean; error?: string }> {
    try {
      project.updatedAt = new Date().toISOString()
      this.configStore.updateProject(project)
      await this.configStore.save()
      console.log('Project updated:', project.name)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to update project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove a project
   */
  async removeProject(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const project = this.configStore.getProject(projectId)
      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      this.configStore.removeProject(projectId)
      await this.configStore.save()
      console.log('Project removed:', project.name)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to remove project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get a project by ID
   */
  getProject(projectId: string): Project | undefined {
    return this.configStore.getProject(projectId)
  }

  /**
   * Get all projects
   */
  getAllProjects(): Project[] {
    return this.configStore.getProjects()
  }

  /**
   * Get default test command for a project
   */
  getDefaultTestCommand(project: Project): string {
    const commands: Record<string, string> = {
      jest: 'npm test',
      vitest: 'npm test',
      pytest: 'pytest',
      'go-test': 'go test ./...',
      'cargo-test': 'cargo test',
      other: 'npm test'
    }
    return project.testCommand || commands[project.testFramework] || 'npm test'
  }
}

// Singleton instance
let projectManagerInstance: ProjectManager | null = null

export function getProjectManager(): ProjectManager {
  if (!projectManagerInstance) {
    projectManagerInstance = new ProjectManager()
  }
  return projectManagerInstance
}
