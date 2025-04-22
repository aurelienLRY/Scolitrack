import { AuroraText } from "@/components/ui/aurora-text";
import { Dots, RoundSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function LoadingPage() {
  return (
    <div className="h-screen w-screen flex flex-col gap-4 justify-center items-center">
      <div className="flex gap-4">
        <AuroraText
          colors={[
            "#FF0080",
            "#7928CA",
            "#0070F3",
            "#38bdf8",
            "#a855f7",
            "#2dd4bf",
          ]}
          speed={1}
          className="text-6xl font-bold"
        >
          Chargement en cours
        </AuroraText>
        <div className="flex items-end -translate-y-4">
          <Dots variant="v3" size="xs" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold">
          je vous prépare l&apos;affichage aux petit ognions 🧅
        </h2>
      </div>
    </div>
  );
}

export function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full h-full items-center justify-center",
        className
      )}
    >
      <RoundSpinner size="lg" />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );
}
