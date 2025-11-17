export function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-6 bg-card animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-32 mb-2"></div>
          <div className="h-3 bg-muted rounded w-48"></div>
        </div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-24"></div>
          <div className="h-3 bg-muted rounded w-12"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-16"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-9 bg-muted rounded"></div>
        <div className="flex-1 h-9 bg-muted rounded"></div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
