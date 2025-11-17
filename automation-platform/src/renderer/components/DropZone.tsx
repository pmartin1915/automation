import { useState, useCallback, DragEvent } from 'react'

interface DropZoneProps {
  onDrop: (paths: string[]) => void
  children?: React.ReactNode
  overlay?: boolean
}

/**
 * Drop zone component for dragging and dropping folders
 * Shows overlay when files are being dragged over the window
 */
export function DropZone({ onDrop, children, overlay = true }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragCounter((prev) => prev + 1)

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragCounter((prev) => {
      const newCount = prev - 1
      if (newCount === 0) {
        setIsDragging(false)
      }
      return newCount
    })
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
      setDragCounter(0)

      const files = Array.from(e.dataTransfer.files)

      // For Electron apps, we can get the file path directly
      const paths = files
        .map((file: any) => file.path)
        .filter((path: string) => path && path.length > 0)

      if (paths.length > 0) {
        onDrop(paths)
      }
    },
    [onDrop]
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-full"
    >
      {children}

      {/* Drag Overlay */}
      {overlay && isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 border-4 border-dashed border-primary rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-semibold mb-2">Drop folder here</h3>
            <p className="text-muted-foreground">
              Release to add project to automation platform
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
