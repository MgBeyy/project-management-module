import "./App.css";
// import { initBilgeModelReact } from "./initBilgeModelReact.ts";

import AppRoutes from "./routes.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

// initBilgeModelReact();

function App() {
  return (
    <>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </>
  );
}

export default App;
