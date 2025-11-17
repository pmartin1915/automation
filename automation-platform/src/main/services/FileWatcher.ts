import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * FileWatcher Service
 *
 * Watches project directories for file changes and triggers debounced test execution.
 * Features:
 * - Watches source and test files
 * - Ignores node_modules, .git, build directories
 * - Debounces changes to avoid excessive test runs
 * - Per-project watchers with lifecycle management
 */

export interface WatcherOptions {
  projectId: string;
  projectPath: string;
  testFramework: string;
  debounceMs?: number;
}

export interface FileChangeEvent {
  projectId: string;
  filePath: string;
  eventType: 'add' | 'change' | 'unlink';
}

export class FileWatcher extends EventEmitter {
  private watchers: Map<string, FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEFAULT_DEBOUNCE_MS = 500;

  /**
   * Start watching a project directory
   */
  startWatching(options: WatcherOptions): void {
    const { projectId, projectPath, testFramework, debounceMs = this.DEFAULT_DEBOUNCE_MS } = options;

    // Stop existing watcher if present
    if (this.watchers.has(projectId)) {
      this.stopWatching(projectId);
    }

    console.log(`[FileWatcher] Starting watch for project ${projectId} at ${projectPath}`);

    // Determine file patterns to watch based on test framework
    const watchPatterns = this.getWatchPatterns(projectPath, testFramework);

    // Ignored paths (performance optimization)
    const ignored = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/target/**',  // Rust
      '**/__pycache__/**',  // Python
      '**/*.pyc',
      '**/.pytest_cache/**',
      '**/.venv/**',
      '**/venv/**',
      '**/.idea/**',
      '**/.vscode/**',
    ];

    // Create watcher
    const watcher = chokidar.watch(watchPatterns, {
      ignored,
      persistent: true,
      ignoreInitial: true,  // Don't trigger on initial scan
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
      depth: 10,  // Limit recursion depth
    });

    // Handle file events
    watcher
      .on('add', (filePath) => this.handleFileChange(projectId, filePath, 'add', debounceMs))
      .on('change', (filePath) => this.handleFileChange(projectId, filePath, 'change', debounceMs))
      .on('unlink', (filePath) => this.handleFileChange(projectId, filePath, 'unlink', debounceMs))
      .on('error', (error) => {
        console.error(`[FileWatcher] Error watching ${projectId}:`, error);
        this.emit('error', { projectId, error });
      })
      .on('ready', () => {
        console.log(`[FileWatcher] Ready watching ${projectId}`);
        this.emit('ready', { projectId });
      });

    this.watchers.set(projectId, watcher);
  }

  /**
   * Stop watching a project
   */
  async stopWatching(projectId: string): Promise<void> {
    const watcher = this.watchers.get(projectId);
    if (watcher) {
      console.log(`[FileWatcher] Stopping watch for project ${projectId}`);

      // Clear any pending debounce timer
      const timer = this.debounceTimers.get(projectId);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(projectId);
      }

      // Close watcher
      await watcher.close();
      this.watchers.delete(projectId);

      this.emit('stopped', { projectId });
    }
  }

  /**
   * Stop all watchers (cleanup)
   */
  async stopAll(): Promise<void> {
    console.log('[FileWatcher] Stopping all watchers');
    const projectIds = Array.from(this.watchers.keys());
    await Promise.all(projectIds.map(id => this.stopWatching(id)));
  }

  /**
   * Check if a project is being watched
   */
  isWatching(projectId: string): boolean {
    return this.watchers.has(projectId);
  }

  /**
   * Get watch statistics
   */
  getStats(): { totalWatchers: number; projectIds: string[] } {
    return {
      totalWatchers: this.watchers.size,
      projectIds: Array.from(this.watchers.keys()),
    };
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(
    projectId: string,
    filePath: string,
    eventType: 'add' | 'change' | 'unlink',
    debounceMs: number
  ): void {
    console.log(`[FileWatcher] ${eventType}: ${filePath} (project: ${projectId})`);

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(projectId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      console.log(`[FileWatcher] Debounced trigger for ${projectId}`);
      this.emit('change', { projectId, filePath, eventType });
      this.debounceTimers.delete(projectId);
    }, debounceMs);

    this.debounceTimers.set(projectId, timer);
  }

  /**
   * Determine which file patterns to watch based on test framework
   */
  private getWatchPatterns(projectPath: string, testFramework: string): string[] {
    const patterns: string[] = [];

    switch (testFramework) {
      case 'jest':
      case 'vitest':
        patterns.push(
          path.join(projectPath, '**/*.{js,jsx,ts,tsx}'),
          path.join(projectPath, '**/*.test.{js,jsx,ts,tsx}'),
          path.join(projectPath, '**/*.spec.{js,jsx,ts,tsx}'),
          path.join(projectPath, '**/__tests__/**/*.{js,jsx,ts,tsx}')
        );
        break;

      case 'pytest':
        patterns.push(
          path.join(projectPath, '**/*.py'),
          path.join(projectPath, '**/test_*.py'),
          path.join(projectPath, '**/*_test.py')
        );
        break;

      case 'go':
        patterns.push(
          path.join(projectPath, '**/*.go'),
          path.join(projectPath, '**/*_test.go')
        );
        break;

      case 'cargo':
        patterns.push(
          path.join(projectPath, '**/*.rs'),
          path.join(projectPath, '**/tests/**/*.rs')
        );
        break;

      default:
        // Watch all common source files
        patterns.push(
          path.join(projectPath, '**/*.{js,jsx,ts,tsx,py,go,rs}')
        );
    }

    return patterns;
  }
}

// Singleton instance
let fileWatcherInstance: FileWatcher | null = null;

export function getFileWatcher(): FileWatcher {
  if (!fileWatcherInstance) {
    fileWatcherInstance = new FileWatcher();
  }
  return fileWatcherInstance;
}
