// src/components/ProfileSkeleton.jsx
export default function ProfileSkeleton() {
  return (
    <div className="md:flex w-full animate-pulse">
      {/* Right Content Skeleton */}
      <div className="flex-1 p-6 bg-gray-50 rounded-lg">
        {/* Heading */}
        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>

        {/* Grid Form Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="mt-6 w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}