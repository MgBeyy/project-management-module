import React from "react";
import { Tabs } from "antd";

const App: React.FC = () => (
  <Tabs
    type="card"
    items={[
      {
        key: "1",
        label: <span className="text-gray-500 font-semibold ">Projeler</span>,
      },
      {
        key: "2",
        label: <span className="text-gray-500 font-semibold">Görevler</span>,
      },
      {
        key: "3",
        label: <span className="text-gray-500 font-semibold">Etkinlikler</span>,
      },
    ]}
  />
);

export default App;
