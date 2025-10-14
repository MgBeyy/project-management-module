import "./App.css";
import AppRoutes from "./routes.tsx";
import { App as AntApp, ConfigProvider } from "antd";
import trTR from "antd/locale/tr_TR";
import { useEffect } from "react";
import { initNotificationApi } from "./utils/notification";

// initBilgeModelReact();

function AppContent() {
  const { notification } = AntApp.useApp();

  useEffect(() => {
    // Notification API'yi global olarak initialize et
    initNotificationApi(notification);
  }, [notification]);

  return <AppRoutes />;
}

function App() {
  return (
    <ConfigProvider locale={trTR}>
      <AntApp 
        notification={{ placement: "bottomRight" }}
        message={{ maxCount: 3, top: 20 }}
      >
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
