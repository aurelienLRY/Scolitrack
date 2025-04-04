"use client";
import Card from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { motion } from "framer-motion";
export const SkeletonRolesList = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="flex flex-1 flex-col gap-4 max-w-[800px]"
        variant="primary"
      >
        <div className="px-4 py-5 sm:px-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="overflow-x-auto">
            <table className="divide-y divide-primary overflow-x-auto w-full">
              <thead className="bg-primary/10">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-medium text-xl text-text/50 uppercase tracking-wider"
                  >
                    <Skeleton className="h-6 w-24" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xl font-medium text-text/50 uppercase tracking-wider"
                  >
                    <Skeleton className="h-6 w-32" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xl font-medium text-text/50 uppercase tracking-wider"
                  >
                    <Skeleton className="h-6 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 py-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="hover:bg-slate-400/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-48" />
                    </td>
                    <td className="h-full">
                      <div className="flex gap-2 items-center justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
