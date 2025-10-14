import "./App.css";
// import { initBilgeModelReact } from "./initBilgeModelReact.ts";

import AppRoutes from "./routes.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { App as AntApp } from "antd";

// initBilgeModelReact();

function App() {
  return (
    <>
      <Provider store={store}>
        <AntApp notification={{ placement: "bottomRight" }}>
          <AppRoutes />
        </AntApp>
      </Provider>
    </>
  );
}

export default App;
