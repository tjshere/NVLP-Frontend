import React from 'react';

// Base Skeleton component for shimmer effect
export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
};

// Profile Summary Skeleton
export const ProfileSummarySkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar skeleton */}
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          {/* Username skeleton */}
          <Skeleton className="h-5 w-24 mb-2" />
          {/* Email skeleton */}
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Badge skeletons */}
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
};

// Course List Skeleton
export const CourseListSkeleton = ({ count = 3 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="mb-4">
        <Skeleton className="h-7 w-48" />
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Icon skeleton */}
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                {/* Course title skeleton */}
                <Skeleton className="h-5 w-48 mb-2" />
                {/* Course description skeleton */}
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            {/* Button skeleton */}
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Sensory Panel Skeleton
export const SensoryPanelSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
      <Skeleton className="h-6 w-32 mb-3" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

// Smart Tags Skeleton
export const SmartTagsSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    </div>
  );
};

export default Skeleton;

