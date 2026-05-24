export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-ink-800 rounded-xl animate-pulse ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      {/* Goal + rings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Skeleton className="xl:col-span-1 h-64 rounded-2xl" />
        <div className="xl:col-span-2 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
      {/* Client chart */}
      <Skeleton className="h-72 rounded-2xl" />
      {/* Heatmap */}
      <Skeleton className="h-48 rounded-2xl" />
      {/* Table */}
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
