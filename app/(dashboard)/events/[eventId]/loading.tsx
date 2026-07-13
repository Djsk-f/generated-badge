/**
 * Loading skeleton pour la page de détail d'un événement.
 *
 * @module app/(dashboard)/events/[eventId]/loading
 */

export default function EventDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}
