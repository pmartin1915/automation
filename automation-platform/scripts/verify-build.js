#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that the build was successful and all required files exist
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REQUIRED_FILES = [
  'dist/main/index.js',
  'dist/preload/index.js',
  'dist/renderer/index.html',
  'dist/renderer/assets',
]

const REQUIRED_MAIN_SERVICES = [
  'dist/main/services/ProjectManager.js',
  'dist/main/services/TestRunner.js',
  'dist/main/services/GitService.js',
  'dist/main/services/SessionService.js',
  'dist/main/services/ContextBuilder.js',
  'dist/main/services/ActivityService.js',
]

class BuildVerifier {
  constructor() {
    this.errors = []
    this.warnings = []
    this.rootDir = path.join(__dirname, '..')
  }

  log(message, type = 'info') {
    const prefix = {
      info: '[INFO]',
      success: '[SUCCESS]',
      warning: '[WARNING]',
      error: '[ERROR]',
    }[type]

    console.log(`${prefix} ${message}`)
  }

  checkFileExists(filePath) {
    const fullPath = path.join(this.rootDir, filePath)
    return fs.existsSync(fullPath)
  }

  checkDirectoryExists(dirPath) {
    const fullPath = path.join(this.rootDir, dirPath)
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()
  }

  verifyRequiredFiles() {
    this.log('Verifying required files...')

    REQUIRED_FILES.forEach(file => {
      if (!this.checkFileExists(file)) {
        this.errors.push(`Missing required file: ${file}`)
      } else {
        this.log(`Found: ${file}`, 'success')
      }
    })
  }

  verifyMainServices() {
    this.log('\nVerifying main process services...')

    REQUIRED_MAIN_SERVICES.forEach(service => {
      if (!this.checkFileExists(service)) {
        this.errors.push(`Missing service: ${service}`)
      } else {
        this.log(`Found: ${service}`, 'success')
      }
    })
  }

  verifyPackageJson() {
    this.log('\nVerifying package.json configuration...')

    const packageJsonPath = path.join(this.rootDir, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    // Check main entry point
    if (packageJson.main !== 'dist/main/index.js') {
      this.errors.push(
        `Invalid main entry point in package.json: ${packageJson.main}`
      )
    } else {
      this.log('Main entry point is correct', 'success')
    }

    // Check scripts
    const requiredScripts = ['build', 'start', 'package', 'test']
    requiredScripts.forEach(script => {
      if (!packageJson.scripts[script]) {
        this.warnings.push(`Missing script: ${script}`)
      }
    })
  }

  verifyBuildSize() {
    this.log('\nVerifying build size...')

    const distDir = path.join(this.rootDir, 'dist')

    try {
      const sizeOutput = execSync(`du -sh ${distDir}`, {
        encoding: 'utf8',
      }).trim()
      this.log(`Build size: ${sizeOutput}`, 'info')

      // Parse size (assuming output like "10M dist")
      const sizeMatch = sizeOutput.match(/^(\d+\.?\d*)([KMG])/)
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1])
        const unit = sizeMatch[2]

        // Warn if build is too large (> 500MB)
        if (unit === 'G' || (unit === 'M' && size > 500)) {
          this.warnings.push(
            `Build size is large (${sizeOutput}). Consider optimization.`
          )
        }
      }
    } catch (error) {
      this.warnings.push(`Could not determine build size: ${error.message}`)
    }
  }

  verifyTypeScriptCompilation() {
    this.log('\nVerifying TypeScript compilation...')

    const tsconfigFiles = [
      'tsconfig.json',
      'tsconfig.main.json',
      'tsconfig.preload.json',
    ]

    tsconfigFiles.forEach(file => {
      if (!this.checkFileExists(file)) {
        this.errors.push(`Missing TypeScript config: ${file}`)
      } else {
        this.log(`Found: ${file}`, 'success')
      }
    })

    // Check for .d.ts files in dist
    const distMainPath = path.join(this.rootDir, 'dist/main')
    if (this.checkDirectoryExists('dist/main')) {
      const files = fs.readdirSync(distMainPath)
      const hasDeclarationFiles = files.some(f => f.endsWith('.d.ts'))

      if (!hasDeclarationFiles) {
        this.warnings.push(
          'No TypeScript declaration files found in dist/main'
        )
      }
    }
  }

  generateReport() {
    this.log('\n========================================')
    this.log('BUILD VERIFICATION REPORT')
    this.log('========================================\n')

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('All checks passed successfully!', 'success')
      return true
    }

    if (this.errors.length > 0) {
      this.log(`\nErrors (${this.errors.length}):`, 'error')
      this.errors.forEach(error => this.log(error, 'error'))
    }

    if (this.warnings.length > 0) {
      this.log(`\nWarnings (${this.warnings.length}):`, 'warning')
      this.warnings.forEach(warning => this.log(warning, 'warning'))
    }

    return this.errors.length === 0
  }

  async run() {
    this.log('Starting build verification...\n')

    this.verifyRequiredFiles()
    this.verifyMainServices()
    this.verifyPackageJson()
    this.verifyBuildSize()
    this.verifyTypeScriptCompilation()

    const success = this.generateReport()

    if (!success) {
      process.exit(1)
    }
  }
}

// Run verification
const verifier = new BuildVerifier()
verifier.run().catch(error => {
  console.error('[FATAL ERROR]', error)
  process.exit(1)
})
