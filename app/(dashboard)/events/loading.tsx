/**
 * Loading skeleton pour la page des événements.
 *
 * @module app/(dashboard)/events/loading
 */

export default function EventsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-10 w-44 bg-gray-200 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
