export type NotificationTarget = {
  type: "user" | "role";
  id: string; // userId ou roleId
};

export type NotificationData = {
  link?: string; //lien de la notification
  type?: string; //type de la notification
  priority?: "high" | "normal" | "low"; //priorité de la notification

  [key: string]: string | number | boolean | undefined;
};

export type NotificationContent = {

  title: string; //titre de la notification
  message: string;
  target: NotificationTarget;
  data?: NotificationData;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
};
