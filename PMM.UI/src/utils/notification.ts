import { App } from "antd";

type MessageApi = ReturnType<typeof App.useApp>["message"];

let messageApi: MessageApi | null = null;

export const initNotificationApi = (api: MessageApi) => {
  messageApi = api;
  console.log("✅ Message API initialize edildi");
};

const buildContent = (message: string, description?: string) =>
  description ? `${message} - ${description}` : message;

const ensureMessageApi = () => {
  if (!messageApi) {
    console.error("❌ Message API henüz initialize edilmedi!");
    return false;
  }
  return true;
};

export const showNotification = {
  success: (message: string, description?: string) => {
    console.log("✅ showNotification.success çağrıldı:", message);
    if (!ensureMessageApi()) return;
    messageApi!.success(buildContent(message, description), 3);
  },
  error: (message: string, description?: string) => {
    console.log("❌ showNotification.error çağrıldı:", message, description);
    if (!ensureMessageApi()) return;
    messageApi!.error(buildContent(message, description), 3);
  },
  warning: (message: string, description?: string) => {
    console.log("⚠️ showNotification.warning çağrıldı:", message);
    if (!ensureMessageApi()) return;
    messageApi!.warning(buildContent(message, description), 3);
  },
  info: (message: string, description?: string) => {
    console.log("ℹ️ showNotification.info çağrıldı:", message);
    if (!ensureMessageApi()) return;
    messageApi!.info(buildContent(message, description), 3);
  },
};
