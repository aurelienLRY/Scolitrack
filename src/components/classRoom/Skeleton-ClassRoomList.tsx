import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonClassRoomList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <SkeletonClassRoomCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonClassRoomCard() {
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Skeleton className="w-[60px] h-[60px] rounded-md" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="mt-auto pt-2 border-t flex justify-end">
        <Skeleton className="h-5 w-36" />
      </div>
    </Card>
  );
}
