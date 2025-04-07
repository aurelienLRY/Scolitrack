import { Card, Skeleton } from "@/components/ui";

export default function SkeletonEducationLevelManager() {
  return (
    <Card className="p-6 space-y-6 w-full" variant="primary">
      <h3 className="text-xl font-semibold">Niveaux d&apos;enseignement</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 border rounded-md h-[70px]"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
