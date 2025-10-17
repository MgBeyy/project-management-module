import { Routes, Route } from "react-router-dom";
import Projects from "./pages/projects/projects";
import Tasks from "./pages/tasks/tasks";
import Activities from "./pages/activities/activities";
import AppLayout from "./components/layouts/app-layout";


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
