import { type NotificationType } from "../model/notification.store";

export const TOAST_DURATION_MS = 5000;
export const MAX_NOTIFICATIONS = 200;
export const NOTIFICATIONS_SETTINGS_KEY = "notifications";
export const NOTIFICATIONS_HISTORY_KEY = "notificationHistory";

export const NOTIFICATION_COLORS_BY_TYPE: Record<NotificationType, string> = {
  transaction: "bg-blue-500",
  mining: "bg-emerald-500",
  security: "bg-red-500",
  info: "bg-slate-400",
};
