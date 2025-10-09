import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
// import Projects from "./pages/projects";
// import Tasks from "./pages/tasks";
// import Activities from "./pages/activities";
import Projects from "./pages/projects/projects";
import CreateProject from "./pages/projects/create-project";
import CrudLayout from "./layouts/crud-layout";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/pm-module/projects" element={<Projects />} />

        {/* <Route path="/pm-module/tasks" element={<Tasks />} />
        <Route path="/pm-module/activities" element={<Activities />} /> */}
      </Route>
      <Route path="/" element={<CrudLayout />}>
        <Route path="/pm-module/projects/create" element={<CreateProject />} />
      </Route>
    </Routes>
  );
}
