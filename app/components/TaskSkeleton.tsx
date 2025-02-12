import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </Card>
  );
} 