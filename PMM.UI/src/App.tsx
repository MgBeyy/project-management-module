import "./App.css";
import AppRoutes from "./routes.tsx";
import { App as AntApp, ConfigProvider } from "antd";
import trTR from "antd/locale/tr_TR";
import { useEffect } from "react";
import { initNotificationApi } from "./utils/notification";

// initBilgeModelReact();

function AppContent() {
  const { message } = AntApp.useApp();

  useEffect(() => {
    // Message API'yi global olarak initialize et
    initNotificationApi(message);
  }, [message]);

  return <AppRoutes />;
}

function App() {
  return (
    <ConfigProvider locale={trTR}>
      <AntApp message={{ maxCount: 3, top: 20 }}>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
