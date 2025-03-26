import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const NotificationToggle = () => {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useNotification();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <Tooltip
      content={
        isSubscribed
          ? "Désactiver les notifications"
          : "Activer les notifications"
      }
      position="left"
    >
      <Button
        size="icon"
        onClick={isSubscribed ? unsubscribe : subscribe}
        className={cn(
          "w-full text-center",
          "flex gap-2 cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
          "hover:bg-slate-100 focus:bg-slate-100 hover:text-accent focus:text-accent",
          "shadow-none border-none bg-transparent"
        )}
      >
        {isSubscribed ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
    </Tooltip>
  );
};
