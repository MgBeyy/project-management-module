import { App } from "antd";

export const useNotification = () => {
  const { notification } = App.useApp();

  return {
    success: (message: string, description?: string) => {
      notification.success({
        message,
        description,
        placement: "bottomRight",
      });
    },
    error: (message: string, description?: string) => {
      notification.error({
        message,
        description,
        placement: "bottomRight",
      });
    },
    info: (message: string, description?: string) => {
      notification.info({
        message,
        description,
        placement: "bottomRight",
      });
    },
    warning: (message: string, description?: string) => {
      notification.warning({
        message,
        description,
        placement: "bottomRight",
      });
    },
  };
};
