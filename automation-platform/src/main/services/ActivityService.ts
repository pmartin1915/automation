import type { Activity, Session, TestSuiteResult, SuccessMetrics } from '../../shared/types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'

/**
 * ActivityService
 *
 * Tracks all project activities in a unified timeline:
 * - Session events (created, started, paused, completed)
 * - Test runs (passed/failed)
 * - Git commits
 * - File changes
 *
 * Provides analytics and metrics for success tracking.
 */
export class ActivityService {
  private static instance: ActivityService
  private activities: Map<string, Activity> = new Map()
  private dataPath: string
  private initialized = false
  private maxActivitiesPerProject = 500  // Keep last 500 activities per project

  private constructor() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~'
    const configDir = path.join(homeDir, '.claude-automation')
    this.dataPath = path.join(configDir, 'activities.json')
  }

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService()
    }
    return ActivityService.instance
  }

  /**
   * Initialize the service and load existing activities
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.dataPath)
      await fs.mkdir(configDir, { recursive: true })

      // Load existing activities
      await this.loadActivities()
      this.initialized = true
      console.log(`ActivityService initialized with ${this.activities.size} activities`)
    } catch (error) {
      console.error('Failed to initialize ActivityService:', error)
      throw error
    }
  }

  /**
   * Load activities from disk
   */
  private async loadActivities(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8')
      const activitiesArray: Activity[] = JSON.parse(data)

      this.activities.clear()
      activitiesArray.forEach(activity => {
        this.activities.set(activity.id, activity)
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist yet, start with empty activities
        this.activities.clear()
      } else {
        console.error('Error loading activities:', error)
        throw error
      }
    }
  }

  /**
   * Save activities to disk
   */
  private async saveActivities(): Promise<void> {
    try {
      const activitiesArray = Array.from(this.activities.values())
      await fs.writeFile(this.dataPath, JSON.stringify(activitiesArray, null, 2))
    } catch (error) {
      console.error('Error saving activities:', error)
      throw error
    }
  }

  /**
   * Log a new activity
   */
  async logActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const newActivity: Activity = {
      id: randomUUID(),
      ...activity
    }

    this.activities.set(newActivity.id, newActivity)
    await this.saveActivities()

    // Cleanup old activities if needed
    await this.cleanupOldActivities(activity.projectId)

    console.log(`Activity logged: ${newActivity.type} - ${newActivity.title}`)
    return newActivity
  }

  /**
   * Remove old activities to keep storage manageable
   */
  private async cleanupOldActivities(projectId: string): Promise<void> {
    const projectActivities = Array.from(this.activities.values())
      .filter(a => a.projectId === projectId)
      .sort((a, b) => b.timestamp - a.timestamp)

    if (projectActivities.length > this.maxActivitiesPerProject) {
      const toRemove = projectActivities.slice(this.maxActivitiesPerProject)
      toRemove.forEach(activity => {
        this.activities.delete(activity.id)
      })
      await this.saveActivities()
      console.log(`Cleaned up ${toRemove.length} old activities for project ${projectId}`)
    }
  }

  /**
   * Get activities for a specific project
   */
  async getActivitiesByProject(projectId: string, limit: number = 50): Promise<Activity[]> {
    const projectActivities = Array.from(this.activities.values())
      .filter(a => a.projectId === projectId)
      .sort((a, b) => b.timestamp - a.timestamp)  // Most recent first
      .slice(0, limit)

    return projectActivities
  }

  /**
   * Get global activity feed (all projects)
   */
  async getGlobalFeed(limit: number = 100): Promise<Activity[]> {
    const allActivities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp - a.timestamp)  // Most recent first
      .slice(0, limit)

    return allActivities
  }

  /**
   * Get success metrics across all sessions
   */
  async getSuccessMetrics(projectId?: string): Promise<SuccessMetrics> {
    let sessionActivities = Array.from(this.activities.values())
      .filter(a => a.type === 'session' && a.metadata.sessionStatus === 'completed')

    if (projectId) {
      sessionActivities = sessionActivities.filter(a => a.projectId === projectId)
    }

    const totalSessions = sessionActivities.length
    const successfulSessions = sessionActivities.filter(a => a.metadata.outcome === 'success').length
    const completedSessions = totalSessions

    // Calculate durations
    let totalDuration = 0
    let sessionsWithDuration = 0

    sessionActivities.forEach(activity => {
      if (activity.metadata.outcome) {
        // Estimate duration from timestamp (this is approximate)
        // In real implementation, you'd get this from session data
        sessionsWithDuration++
      }
    })

    const avgDuration = sessionsWithDuration > 0 ? totalDuration / sessionsWithDuration : 0

    // Calculate success rates by template type (approximate)
    const testFixActivities = sessionActivities.filter(a =>
      a.metadata.sessionName?.toLowerCase().includes('fix') ||
      a.metadata.sessionName?.toLowerCase().includes('test')
    )
    const testFixSuccess = testFixActivities.filter(a => a.metadata.outcome === 'success').length
    const testFixSuccessRate = testFixActivities.length > 0
      ? (testFixSuccess / testFixActivities.length) * 100
      : 0

    const featureActivities = sessionActivities.filter(a =>
      a.metadata.sessionName?.toLowerCase().includes('feature') ||
      a.metadata.sessionName?.toLowerCase().includes('add')
    )
    const featureSuccess = featureActivities.filter(a => a.metadata.outcome === 'success').length
    const featureAddSuccessRate = featureActivities.length > 0
      ? (featureSuccess / featureActivities.length) * 100
      : 0

    const refactorActivities = sessionActivities.filter(a =>
      a.metadata.sessionName?.toLowerCase().includes('refactor')
    )
    const refactorSuccess = refactorActivities.filter(a => a.metadata.outcome === 'success').length
    const refactorSuccessRate = refactorActivities.length > 0
      ? (refactorSuccess / refactorActivities.length) * 100
      : 0

    return {
      totalSessions,
      completedSessions,
      successfulSessions,
      successRate: totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0,
      avgDuration,
      testFixSuccessRate,
      featureAddSuccessRate,
      refactorSuccessRate
    }
  }

  /**
   * Auto-generate activity when a session is created
   */
  async onSessionCreated(session: Session, projectName: string): Promise<Activity> {
    return this.logActivity({
      projectId: session.projectId,
      type: 'session',
      timestamp: session.createdAt,
      title: `Session created: ${session.name}`,
      description: session.description,
      metadata: {
        sessionId: session.id,
        sessionName: session.name,
        sessionStatus: 'created'
      }
    })
  }

  /**
   * Auto-generate activity when a session is started
   */
  async onSessionStarted(session: Session, projectName: string): Promise<Activity> {
    return this.logActivity({
      projectId: session.projectId,
      type: 'session',
      timestamp: session.startedAt || Date.now(),
      title: `Session started: ${session.name}`,
      description: session.goal || session.description,
      metadata: {
        sessionId: session.id,
        sessionName: session.name,
        sessionStatus: 'in_progress'
      }
    })
  }

  /**
   * Auto-generate activity when a session is completed
   */
  async onSessionCompleted(session: Session, projectName: string): Promise<Activity> {
    const outcomeEmoji = {
      success: '✅',
      partial: '⚠️',
      blocked: '🚫',
      abandoned: '❌'
    }

    const emoji = session.outcome ? outcomeEmoji[session.outcome] : ''

    return this.logActivity({
      projectId: session.projectId,
      type: 'session',
      timestamp: session.completedAt || Date.now(),
      title: `${emoji} Session completed: ${session.name}`,
      description: `Outcome: ${session.outcome || 'unknown'}`,
      metadata: {
        sessionId: session.id,
        sessionName: session.name,
        sessionStatus: 'completed',
        outcome: session.outcome
      }
    })
  }

  /**
   * Auto-generate activity when tests complete
   */
  async onTestComplete(projectId: string, projectName: string, results: TestSuiteResult): Promise<Activity> {
    const status = results.failed === 0 ? '✅' : '❌'
    const title = results.failed === 0
      ? `All tests passing (${results.passed}/${results.totalTests})`
      : `Tests failing (${results.failed} failed, ${results.passed} passed)`

    return this.logActivity({
      projectId,
      type: 'test_run',
      timestamp: new Date(results.timestamp).getTime(),
      title: `${status} ${title}`,
      description: `Completed in ${(results.duration / 1000).toFixed(2)}s`,
      metadata: {
        testsPassed: results.passed,
        testsFailed: results.failed
      }
    })
  }

  /**
   * Auto-generate activity when a commit is made
   */
  async onCommit(projectId: string, projectName: string, commitSha: string, message: string): Promise<Activity> {
    return this.logActivity({
      projectId,
      type: 'commit',
      timestamp: Date.now(),
      title: `📝 Commit: ${message.split('\n')[0]}`,
      description: message,
      metadata: {
        commitSha,
        commitMessage: message
      }
    })
  }

  /**
   * Auto-generate activity when files change (file watcher)
   */
  async onFileChange(projectId: string, projectName: string, files: string[]): Promise<Activity> {
    return this.logActivity({
      projectId,
      type: 'file_change',
      timestamp: Date.now(),
      title: `📄 Files changed (${files.length})`,
      description: files.slice(0, 3).join(', ') + (files.length > 3 ? '...' : ''),
      metadata: {
        files
      }
    })
  }

  /**
   * Delete all activities for a project (when project is removed)
   */
  async deleteProjectActivities(projectId: string): Promise<void> {
    const toDelete = Array.from(this.activities.values())
      .filter(a => a.projectId === projectId)

    toDelete.forEach(activity => {
      this.activities.delete(activity.id)
    })

    await this.saveActivities()
    console.log(`Deleted ${toDelete.length} activities for project ${projectId}`)
  }
}
