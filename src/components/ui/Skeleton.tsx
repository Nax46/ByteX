import React from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-[#E5E5DF]/70',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  className,
}) => {
  return (
    <div className={cn('w-full bg-white rounded-xl border border-[#E5E5DF] overflow-hidden', className)}>
      {/* Table Header Placeholder */}
      <div className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 px-4 py-3.5 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table Rows Placeholder */}
      <div className="divide-y divide-[#E5E5DF]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3.5 flex items-center gap-4">
            <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/4" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
            {Array.from({ length: columns - 1 }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={cn(
                  'h-3 hidden sm:block',
                  cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-28' : 'w-16'
                )}
              />
            ))}
            <Skeleton className="h-7 w-16 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E5DF]">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-[#E5E5DF] space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-[#E5E5DF] space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-[#E5E5DF] last:border-0">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E5E5DF] space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl bg-white border border-[#E5E5DF] space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="pt-3 border-t border-[#E5E5DF] flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
