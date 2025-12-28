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

// Progress Insights Skeleton
export const ProgressInsightsSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  );
};

// Lesson Player Skeleton
export const LessonPlayerSkeleton = () => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 animate-pulse">
      {/* Header */}
      <div className="h-16 bg-gray-800 border-b border-gray-700"></div>
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Video area */}
        <div className="w-2/3 bg-black flex items-center justify-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-800 p-4 space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

