import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        ></div>
      ))}
    </>
  );
};

export const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white h-full flex flex-col border border-gray-100 rounded-lg overflow-hidden">
        <Skeleton className="h-[250px] w-full rounded-none" />
        <div className="p-4 flex flex-col flex-grow space-y-3">
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-3 w-1/2" />
             <div className="mt-auto pt-2 flex items-center justify-between">
                 <Skeleton className="h-5 w-16" />
                 <Skeleton className="h-8 w-20 rounded-md" />
             </div>
        </div>
    </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
    <tr className="border-b border-gray-100">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton className={`h-4 ${i === 0 ? 'w-12' : 'w-full'}`} />
            </td>
        ))}
    </tr>
);

export const DashboardCardSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 w-full">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24" />
    </div>
);
