export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="h-14 bg-surface border-b border-border" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[250px] md:h-[400px] bg-gray-200 rounded-xl animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
