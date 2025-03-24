"use client";

import { CardFluo } from "@/components/shared/card";
import { adminNavItems } from "./setup-NavItem.data";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  return (
    <section className="flex justify-center items-center min-h-[calc(100vh-170px)]  gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {adminNavItems.map((item, index) => (
          <div
            key={index}
            className="min-w-[250px] w-full aspect-square max-w-[300px]"
          >
            <CardFluo
              className="p-5  flex flex-col justify-center group"
              onClick={() => router.push(item.href)}
              variant="primary"
            >
              <item.icon className="text-4xl group-hover:text-accent transition-all duration-300 ease-in-out mb-3" />
              <h2 className="text-2xl font-bold">{item.label}</h2>
              {item.description.map((description, index) => (
                <p
                  key={index}
                  className={cn(
                    index === 0
                      ? " font-bold "
                      : "mt-0.5 text-sm italic text-gray-400"
                  )}
                >
                  {description}
                </p>
              ))}
            </CardFluo>
          </div>
        ))}
      </div>
    </section>
  );
}
