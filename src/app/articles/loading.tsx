export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="h-14 bg-surface border-b border-border" />
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="h-[160px] bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
