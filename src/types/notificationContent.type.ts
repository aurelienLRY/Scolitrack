export type NotificationTarget = {
  type: "user" | "role";
  id: string; // userId ou roleId
};

export type NotificationPriority = "high" | "normal" | "low";

export type NotificationAction = {
  action: "open" | "close";
  title: string;
  icon?: string;
};

export type NotificationData = {
  path: string; // Chemin de redirection après clic
  type?: string;
  priority?: NotificationPriority;
  timestamp?: number;
  [key: string]: string | number | boolean | undefined;
};

export type NotificationContent = {
  title: string;
  message: string;
  target: NotificationTarget;
  data?: NotificationData;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  actions?: NotificationAction[];
  renotify?: boolean;
  requireInteraction?: boolean;
  lang?: string;
};
