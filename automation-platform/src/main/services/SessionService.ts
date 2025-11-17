import { Session, SessionSummary } from '../../shared/types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'

/**
 * SessionService
 *
 * Manages development work sessions, tracking progress, linking to test runs and commits,
 * and providing analytics. Sessions represent distinct work periods with goals and outcomes.
 */
export class SessionService {
  private static instance: SessionService
  private sessions: Map<string, Session> = new Map()
  private dataPath: string
  private initialized = false

  private constructor() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~'
    const configDir = path.join(homeDir, '.claude-automation')
    this.dataPath = path.join(configDir, 'sessions.json')
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  /**
   * Initialize the service and load existing sessions
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.dataPath)
      await fs.mkdir(configDir, { recursive: true })

      // Load existing sessions
      await this.loadSessions()
      this.initialized = true
      console.log(`SessionService initialized with ${this.sessions.size} sessions`)
    } catch (error) {
      console.error('Failed to initialize SessionService:', error)
      throw error
    }
  }

  /**
   * Load sessions from disk
   */
  private async loadSessions(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8')
      const sessionsArray: Session[] = JSON.parse(data)

      this.sessions.clear()
      sessionsArray.forEach(session => {
        this.sessions.set(session.id, session)
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist yet, start with empty sessions
        this.sessions.clear()
      } else {
        console.error('Error loading sessions:', error)
        throw error
      }
    }
  }

  /**
   * Save sessions to disk
   */
  private async saveSessions(): Promise<void> {
    try {
      const sessionsArray = Array.from(this.sessions.values())
      await fs.writeFile(
        this.dataPath,
        JSON.stringify(sessionsArray, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.error('Error saving sessions:', error)
      throw error
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'testRunIds' | 'commitShas'>): Promise<Session> {
    await this.initialize()

    const session: Session = {
      id: randomUUID(),
      createdAt: Date.now(),
      testRunIds: [],
      commitShas: [],
      ...sessionData,
      notes: sessionData.notes || ''
    }

    this.sessions.set(session.id, session)
    await this.saveSessions()

    console.log(`Created session: ${session.name} (${session.id})`)
    return session
  }

  /**
   * Get all sessions
   */
  async getAllSessions(): Promise<Session[]> {
    await this.initialize()
    return Array.from(this.sessions.values()).sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Get session by ID
   */
  async getSessionById(id: string): Promise<Session | null> {
    await this.initialize()
    return this.sessions.get(id) || null
  }

  /**
   * Update session
   */
  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    await this.initialize()

    const session = this.sessions.get(id)
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }

    const updatedSession = { ...session, ...updates }
    this.sessions.set(id, updatedSession)
    await this.saveSessions()

    console.log(`Updated session: ${updatedSession.name} (${id})`)
    return updatedSession
  }

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<boolean> {
    await this.initialize()

    const deleted = this.sessions.delete(id)
    if (deleted) {
      await this.saveSessions()
      console.log(`Deleted session: ${id}`)
    }
    return deleted
  }

  /**
   * Start a session (transition from planning to in_progress)
   */
  async startSession(id: string): Promise<Session> {
    await this.initialize()

    const session = this.sessions.get(id)
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }

    if (session.status !== 'planning' && session.status !== 'paused') {
      throw new Error(`Cannot start session in ${session.status} status`)
    }

    const updates: Partial<Session> = {
      status: 'in_progress',
      startedAt: session.startedAt || Date.now()
    }

    return this.updateSession(id, updates)
  }

  /**
   * Pause a session
   */
  async pauseSession(id: string): Promise<Session> {
    await this.initialize()

    const session = this.sessions.get(id)
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }

    if (session.status !== 'in_progress') {
      throw new Error(`Cannot pause session in ${session.status} status`)
    }

    // Calculate duration if started
    let duration = session.duration || 0
    if (session.startedAt) {
      duration += Date.now() - session.startedAt
    }

    const updates: Partial<Session> = {
      status: 'paused',
      duration
    }

    return this.updateSession(id, updates)
  }

  /**
   * Resume a paused session
   */
  async resumeSession(id: string): Promise<Session> {
    await this.initialize()

    const session = this.sessions.get(id)
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }

    if (session.status !== 'paused') {
      throw new Error(`Cannot resume session in ${session.status} status`)
    }

    const updates: Partial<Session> = {
      status: 'in_progress',
      startedAt: Date.now()
    }

    return this.updateSession(id, updates)
  }

  /**
   * Complete a session
   */
  async completeSession(id: string, outcome: 'success' | 'partial' | 'blocked' | 'abandoned', finalNotes?: string): Promise<Session> {
    await this.initialize()

    const session = this.sessions.get(id)
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }

    // Calculate final duration
    let duration = session.duration || 0
    if (session.status === 'in_progress' && session.startedAt) {
      duration += Date.now() - session.startedAt
    }

    const updates: Partial<Session> = {
      status: outcome === 'abandoned' ? 'abandoned' : 'completed',
      outcome,
      completedAt: Date.now(),
      duration,
      notes: finalNotes !== undefined ? finalNotes : session.notes
    }

    return this.updateSession(id, updates)
  }

  /**
   * Get sessions by project
   */
  async getSessionsByProject(projectId: string): Promise<Session[]> {
    await this.initialize()

    return Array.from(this.sessions.values())
      .filter(s => s.projectId === projectId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Get active session for a project (if any)
   */
  async getActiveSessionForProject(projectId: string): Promise<Session | null> {
    await this.initialize()

    return Array.from(this.sessions.values())
      .find(s => s.projectId === projectId && (s.status === 'in_progress' || s.status === 'paused')) || null
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(projectId?: string): Promise<SessionSummary> {
    await this.initialize()

    let sessions = Array.from(this.sessions.values())
    if (projectId) {
      sessions = sessions.filter(s => s.projectId === projectId)
    }

    const totalSessions = sessions.length
    const completed = sessions.filter(s => s.status === 'completed').length
    const inProgress = sessions.filter(s => s.status === 'in_progress').length

    const successfulSessions = sessions.filter(s => s.outcome === 'success').length
    const successRate = completed > 0 ? (successfulSessions / completed) * 100 : 0

    const durationsInMs = sessions
      .filter(s => s.duration !== undefined)
      .map(s => s.duration!)

    const avgDuration = durationsInMs.length > 0
      ? durationsInMs.reduce((sum, d) => sum + d, 0) / durationsInMs.length
      : 0

    return {
      totalSessions,
      completed,
      inProgress,
      successRate,
      avgDuration
    }
  }

  /**
   * Link a test run to a session
   */
  async linkTestRun(sessionId: string, testRunId: string): Promise<boolean> {
    await this.initialize()

    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    if (!session.testRunIds.includes(testRunId)) {
      session.testRunIds.push(testRunId)
      await this.saveSessions()
      console.log(`Linked test run ${testRunId} to session ${sessionId}`)
    }

    return true
  }

  /**
   * Link a commit to a session
   */
  async linkCommit(sessionId: string, commitSha: string): Promise<boolean> {
    await this.initialize()

    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    if (!session.commitShas.includes(commitSha)) {
      session.commitShas.push(commitSha)
      await this.saveSessions()
      console.log(`Linked commit ${commitSha} to session ${sessionId}`)
    }

    return true
  }

  /**
   * Get current duration of an active session
   */
  getCurrentDuration(session: Session): number {
    if (session.status !== 'in_progress' || !session.startedAt) {
      return session.duration || 0
    }

    const currentDuration = Date.now() - session.startedAt
    return (session.duration || 0) + currentDuration
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }
}
