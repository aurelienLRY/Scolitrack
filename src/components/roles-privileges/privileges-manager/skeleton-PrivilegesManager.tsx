"use client";
import Card from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const SkeletonPrivilegesManager = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="flex flex-col gap-4 w-fit max-w-full overflow-hidden"
        variant="primary"
      >
        <div className="px-4 py-5 sm:px-6">
          <h3 className="leading-6">Gestion des privilèges</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Attribuez des privilèges aux différents rôles.
          </p>
        </div>

        <div className="w-full overflow-auto px-4 pb-4">
          <div className="w-full overflow-x-auto">
            <table className="divide-y divide-primary border-collapse rounded-lg w-full min-w-[800px]">
              <thead className="bg-primary/10">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-medium text-xl text-text/80 uppercase tracking-wider"
                  >
                    <Skeleton className="h-6 w-32" />
                  </th>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 font-medium text-xl text-text/50 uppercase tracking-wider"
                    >
                      <div className="flex flex-col items-center">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-16 mt-1" />
                        <div className="mt-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 py-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="hover:bg-slate-400/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-40" />
                    </td>
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Skeleton className="h-5 w-5 rounded-md" />
                        </div>
                      </td>
                    ))}
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
