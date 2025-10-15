import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { message } from "antd";
import "./index.css";

import App from "./App.tsx";

// Ant Design message'ı global olarak ayarla
message.config({
  top: 20,
  duration: 4,
  maxCount: 3,
  prefixCls: 'ant-message',
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
