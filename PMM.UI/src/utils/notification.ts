import { App } from "antd";

// Global notification API holder - AntApp provider olmadan kullanılabilir
let notificationApi: ReturnType<typeof App.useApp>["notification"] | null = null;

// AntApp içinden initialize edilecek
export const initNotificationApi = (api: ReturnType<typeof App.useApp>["notification"]) => {
  notificationApi = api;
  console.log("✅ Notification API initialize edildi");
};

// Global notification instance - garantili çalışma için
export const showNotification = {
  success: (message: string, description?: string) => {
    console.log("✅ showNotification.success çağrıldı:", message);
    if (notificationApi) {
      notificationApi.success({
        message,
        description,
        placement: "bottomRight",
        duration: 4,
      });
    } else {
      console.error("❌ Notification API henüz initialize edilmedi!");
    }
  },
  error: (message: string, description?: string) => {
    console.log("❌ showNotification.error çağrıldı:", message, description);
    if (notificationApi) {
      notificationApi.error({
        message,
        description,
        placement: "bottomRight",
        duration: 4,
      });
    } else {
      console.error("❌ Notification API henüz initialize edilmedi!");
    }
  },
  warning: (message: string, description?: string) => {
    console.log("⚠️ showNotification.warning çağrıldı:", message);
    if (notificationApi) {
      notificationApi.warning({
        message,
        description,
        placement: "bottomRight",
        duration: 4,
      });
    } else {
      console.error("❌ Notification API henüz initialize edilmedi!");
    }
  },
  info: (message: string, description?: string) => {
    console.log("ℹ️ showNotification.info çağrıldı:", message);
    if (notificationApi) {
      notificationApi.info({
        message,
        description,
        placement: "bottomRight",
        duration: 4,
      });
    } else {
      console.error("❌ Notification API henüz initialize edilmedi!");
    }
  },
};
