export type NotificationTarget = {
  type: "user" | "role";
  id: string; // userId ou roleId
};

export type NotificationData = {
  link?: string;
  type?: string;
  priority?: "high" | "normal" | "low";
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
  actions?: {
    action: string;
    title: string;
  }[];
};
