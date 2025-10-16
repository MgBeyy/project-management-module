import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
import Projects from "./pages/projects/projects";
import ProjectDetailsPage from "./pages/projects/project-details";
import Tasks from "./pages/tasks/tasks";
import Activities from "./pages/activities/activities";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/pm-module/projects" element={<Projects />} />
        <Route path="/pm-module/projects/:code" element={<ProjectDetailsPage />} />
        <Route path="/pm-module/tasks" element={<Tasks />} />
        <Route path="/pm-module/activities" element={<Activities />} />
      </Route>
    </Routes>
  );
}
