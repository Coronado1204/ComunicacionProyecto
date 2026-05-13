export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-neutral-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-100 rounded-full w-1/4" />
        <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
        <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
      </div>
    </div>
  </div>
)

export const SkeletonStat = () => (
  <div className="card animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
      <div className="w-8 h-8 bg-neutral-100 rounded-lg" />
    </div>
    <div className="h-8 bg-neutral-100 rounded-full w-1/4" />
    <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
  </div>
)

export const SkeletonTable = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)