import "./App.css";
import AppRoutes from "./routes.tsx";
import { App as AntApp } from "antd";

// initBilgeModelReact();

function App() {
  return (
    <>
        <AntApp notification={{ placement: "bottomRight" }}>
          <AppRoutes />
        </AntApp>
    </>
  );
}

export default App;
