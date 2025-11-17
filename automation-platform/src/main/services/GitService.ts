import simpleGit, { SimpleGit, StatusResult, BranchSummary } from 'simple-git'
import { GitStatus } from '../../shared/types'
import * as fs from 'fs'
import * as path from 'path'

/**
 * GitService - Wrapper around simple-git for Git operations
 *
 * Provides:
 * - Git status detection (branch, dirty state, ahead/behind)
 * - Branch management (create, switch, list)
 * - Commit and push/pull operations
 * - Repository validation
 */
export class GitService {
  private gitInstances: Map<string, SimpleGit> = new Map()

  /**
   * Get or create a SimpleGit instance for a project path
   */
  private getGitInstance(projectPath: string): SimpleGit {
    if (!this.gitInstances.has(projectPath)) {
      const git = simpleGit(projectPath)
      this.gitInstances.set(projectPath, git)
    }
    return this.gitInstances.get(projectPath)!
  }

  /**
   * Check if a directory is a Git repository
   */
  async isGitRepository(projectPath: string): Promise<boolean> {
    try {
      const gitDir = path.join(projectPath, '.git')
      return fs.existsSync(gitDir)
    } catch (error) {
      return false
    }
  }

  /**
   * Get Git status for a project
   * Returns null if not a Git repository or on error
   */
  async getStatus(projectPath: string): Promise<GitStatus | null> {
    try {
      const isRepo = await this.isGitRepository(projectPath)
      if (!isRepo) {
        return null
      }

      const git = this.getGitInstance(projectPath)
      const status: StatusResult = await git.status()

      // Get ahead/behind information
      let ahead = 0
      let behind = 0

      if (status.tracking) {
        // Parse ahead/behind from tracking branch
        // status.ahead and status.behind contain the counts
        ahead = status.ahead || 0
        behind = status.behind || 0
      }

      const gitStatus: GitStatus = {
        branch: status.current || 'unknown',
        ahead,
        behind,
        modified: status.modified.length,
        untracked: status.not_added.length,
        staged: status.staged.length,
        conflicted: status.conflicted.length,
        isDirty: !status.isClean()
      }

      return gitStatus
    } catch (error) {
      console.error(`Error getting git status for ${projectPath}:`, error)
      return null
    }
  }

  /**
   * Get list of all branches (local and remote)
   */
  async getBranches(projectPath: string): Promise<{ local: string[], remote: string[], current: string }> {
    try {
      const git = this.getGitInstance(projectPath)
      const summary: BranchSummary = await git.branch()

      const local = summary.all.filter(b => !b.startsWith('remotes/'))
      const remote = summary.all
        .filter(b => b.startsWith('remotes/'))
        .map(b => b.replace('remotes/origin/', ''))

      return {
        local,
        remote,
        current: summary.current
      }
    } catch (error) {
      console.error(`Error getting branches for ${projectPath}:`, error)
      return { local: [], remote: [], current: '' }
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(projectPath: string, branchName: string, checkout: boolean = true): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)

      if (checkout) {
        await git.checkoutBranch(branchName, 'HEAD')
      } else {
        await git.branch([branchName])
      }

      return true
    } catch (error) {
      console.error(`Error creating branch ${branchName} for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Switch to an existing branch
   */
  async switchBranch(projectPath: string, branchName: string): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)
      await git.checkout(branchName)
      return true
    } catch (error) {
      console.error(`Error switching to branch ${branchName} for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Commit changes with a message
   */
  async commit(projectPath: string, message: string, files?: string[]): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)

      // If specific files provided, stage them; otherwise stage all changes
      if (files && files.length > 0) {
        await git.add(files)
      } else {
        await git.add('.')
      }

      await git.commit(message)
      return true
    } catch (error) {
      console.error(`Error committing changes for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Push commits to remote
   */
  async push(projectPath: string, remote: string = 'origin', branch?: string): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)

      if (branch) {
        await git.push(remote, branch)
      } else {
        await git.push()
      }

      return true
    } catch (error) {
      console.error(`Error pushing to remote for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Pull changes from remote
   */
  async pull(projectPath: string, remote: string = 'origin', branch?: string): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)

      if (branch) {
        await git.pull(remote, branch)
      } else {
        await git.pull()
      }

      return true
    } catch (error) {
      console.error(`Error pulling from remote for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(projectPath: string): Promise<string | null> {
    try {
      const git = this.getGitInstance(projectPath)
      const status = await git.status()
      return status.current || null
    } catch (error) {
      console.error(`Error getting current branch for ${projectPath}:`, error)
      return null
    }
  }

  /**
   * Stage specific files
   */
  async stageFiles(projectPath: string, files: string[]): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)
      await git.add(files)
      return true
    } catch (error) {
      console.error(`Error staging files for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Unstage specific files
   */
  async unstageFiles(projectPath: string, files: string[]): Promise<boolean> {
    try {
      const git = this.getGitInstance(projectPath)
      await git.reset(['HEAD', ...files])
      return true
    } catch (error) {
      console.error(`Error unstaging files for ${projectPath}:`, error)
      return false
    }
  }

  /**
   * Clear cached git instance (useful when project path changes)
   */
  clearCache(projectPath?: string): void {
    if (projectPath) {
      this.gitInstances.delete(projectPath)
    } else {
      this.gitInstances.clear()
    }
  }
}

// Export singleton instance
export const gitService = new GitService()
