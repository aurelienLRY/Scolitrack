import { AuroraText } from "@/components/ui/aurora-text";
import { Dots } from "@/components/ui/spinner";
export function Loading() {
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
