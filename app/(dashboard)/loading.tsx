/**
 * Loading skeleton pour le dashboard.
 *
 * @module app/(dashboard)/loading
 */

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
