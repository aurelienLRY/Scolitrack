import { CardFluo } from "@/components/ui";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionCardProps {
  label: string;
  href: string;
  description: string[];
  icon: LucideIcon;
}

export default function ActionCard({ 
  label, 
  href, 
  description, 
  icon: Icon 
}: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="min-w-[250px] w-full aspect-square max-w-[300px]"
    >
      <Link href={href}>
        <CardFluo
          className="p-5 flex flex-col justify-center group h-full"
          variant="primary"
        >
          <Icon className="text-4xl group-hover:text-accent transition-all duration-300 ease-in-out mb-3" />
          <h2 className="text-2xl font-bold mb-2">{label}</h2>
          {description.map((desc, index) => (
            <p
              key={index}
              className={cn(
                index === 0
                  ? "font-bold text-foreground"
                  : "mt-0.5 text-sm italic text-muted-foreground"
              )}
            >
              {desc}
            </p>
          ))}
        </CardFluo>
      </Link>
    </motion.div>
  );
}
