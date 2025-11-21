import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TherapistSkeleton = () => {
  return (
    <div className="flex gap-8 p-6 max-w-6xl mx-auto">
      {/* Photo Card Skeleton */}
      <Card className="w-80 flex-shrink-0 overflow-hidden">
        <CardContent className="p-0">
          {/* Photo Skeleton */}
          <div className="w-full aspect-[4/3]">
            <Skeleton className="w-full h-full" />
          </div>
          
          {/* Card Footer Skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Content Skeleton */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Specializations */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistSkeleton;