import { useState, useCallback, DragEvent } from 'react'
import { FolderIcon } from './Icons'

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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background/98 via-primary/10 to-background/98 border-4 border-dashed border-primary/60 rounded-2xl backdrop-blur-md animate-pulse">
          <div className="text-center">
            <div className="mb-6 flex justify-center text-primary">
              <FolderIcon size={80} className="animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Drop folder here
            </h3>
            <p className="text-muted-foreground font-medium">
              Release to add project to automation platform
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
