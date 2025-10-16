import { App } from "antd";

const buildContent = (message: string, description?: string) =>
  description ? `${message} - ${description}` : message;

export const useNotification = () => {
  const { message: messageApi } = App.useApp();

  return {
    success: (message: string, description?: string) => {
      messageApi.success(buildContent(message, description), 3);
    },
    error: (message: string, description?: string) => {
      messageApi.error(buildContent(message, description), 3);
    },
    info: (message: string, description?: string) => {
      messageApi.info(buildContent(message, description), 3);
    },
    warning: (message: string, description?: string) => {
      messageApi.warning(buildContent(message, description), 3);
    },
  };
};
