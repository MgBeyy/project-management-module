import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
// import Projects from "./pages/projects";
import Tasks from "./pages/tasks";
import Activities from "./pages/activities";
import Projects from "./pages/projects";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/pm-module/projects" element={<Projects />} />
        <Route path="/pm-module/tasks" element={<Tasks />} />
        <Route path="/pm-module/activities" element={<Activities />} />
      </Route>
    </Routes>
  );
}
