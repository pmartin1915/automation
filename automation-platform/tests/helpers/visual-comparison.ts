import fs from 'fs'
import path from 'path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/**
 * Helper functions for visual regression testing
 */

export interface VisualComparisonResult {
  matches: boolean
  diffPixels: number
  diffPercentage: number
  diffImagePath?: string
}

/**
 * Compare two screenshots and return comparison result
 */
export async function compareScreenshots(
  baselinePath: string,
  currentPath: string,
  diffPath?: string,
  threshold = 0.1
): Promise<VisualComparisonResult> {
  // Read baseline and current images
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath))
  const current = PNG.sync.read(fs.readFileSync(currentPath))

  const { width, height } = baseline

  // Ensure images are same size
  if (current.width !== width || current.height !== height) {
    throw new Error(
      `Image sizes don't match: baseline ${width}x${height}, current ${current.width}x${current.height}`
    )
  }

  // Create diff image
  const diff = new PNG({ width, height })

  // Compare images
  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    width,
    height,
    { threshold }
  )

  const totalPixels = width * height
  const diffPercentage = (diffPixels / totalPixels) * 100

  // Save diff image if path provided
  let diffImagePath: string | undefined
  if (diffPath) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff))
    diffImagePath = diffPath
  }

  return {
    matches: diffPixels === 0,
    diffPixels,
    diffPercentage,
    diffImagePath,
  }
}

/**
 * Create baseline screenshot if it doesn't exist
 */
export function ensureBaselineExists(
  screenshotPath: string,
  baselinePath: string
): void {
  if (!fs.existsSync(baselinePath)) {
    const baselineDir = path.dirname(baselinePath)
    if (!fs.existsSync(baselineDir)) {
      fs.mkdirSync(baselineDir, { recursive: true })
    }
    fs.copyFileSync(screenshotPath, baselinePath)
  }
}

/**
 * Generate visual regression test report
 */
export interface VisualTestResult {
  testName: string
  result: VisualComparisonResult
  baselinePath: string
  currentPath: string
}

export function generateVisualReport(results: VisualTestResult[]): string {
  const totalTests = results.length
  const passedTests = results.filter(r => r.result.matches).length
  const failedTests = totalTests - passedTests

  let report = `
# Visual Regression Test Report

**Date:** ${new Date().toISOString()}
**Total Tests:** ${totalTests}
**Passed:** ${passedTests}
**Failed:** ${failedTests}

## Results

`

  results.forEach(result => {
    const status = result.result.matches ? 'PASS' : 'FAIL'
    report += `
### ${result.testName} - ${status}

- **Diff Pixels:** ${result.result.diffPixels}
- **Diff Percentage:** ${result.result.diffPercentage.toFixed(2)}%
- **Baseline:** ${result.baselinePath}
- **Current:** ${result.currentPath}
${result.result.diffImagePath ? `- **Diff Image:** ${result.result.diffImagePath}` : ''}

`
  })

  return report
}
