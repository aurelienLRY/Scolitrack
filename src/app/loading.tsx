import { Spinner } from "@/components/shared/spinner";

function Loading() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <Spinner />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  );
}

export default Loading;
