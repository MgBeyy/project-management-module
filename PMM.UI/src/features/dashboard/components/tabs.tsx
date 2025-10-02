import React from "react";
import { Tabs } from "antd";
import TaskTab from "./task-tab";
import ActivityTab from "./activity-tab";
import ProjectTab from "./project-tab";

const onChange = (key: string) => {
  console.log(key);
};

const App: React.FC = () => (
  <Tabs
    onChange={onChange}
    type="card"
    items={[
      {
        key: "1",
        label: <span className="text-gray-500 font-semibold ">Projeler</span>,
        children: <ProjectTab />,
      },
      {
        key: "2",
        label: <span className="text-gray-500 font-semibold">Görevler</span>,
        children: <TaskTab />,
      },
      {
        key: "3",
        label: <span className="text-gray-500 font-semibold">Etkinlikler</span>,
        children: <ActivityTab />,
      },
    ]}
  />
);

export default App;
