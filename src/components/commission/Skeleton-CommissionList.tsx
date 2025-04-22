import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function SkeletonCommissionList() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCommissionCard key={i} />
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonCommissionCard() {
  return (
    <Card className="p-4 h-full flex flex-col max-w-[650px]" style={{ borderLeft: "6px solid #e5e7eb" }}>
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
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="mt-auto pt-2 border-t flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-36" />
      </div>
    </Card>
  );
} 