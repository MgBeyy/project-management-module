import { Routes, Route } from "react-router-dom";
import Projects from "./pages/projects/projects";
import Tasks from "./pages/tasks/tasks";
import Activities from "./pages/activities/activities";
import AppLayout from "./components/layouts/app-layout";
import ProjectDetails from "./pages/projects/project-details";
import SupportPage from "./pages/support/support-page";
import NotFoundPage from "./pages/error/not-found";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/pm-module/projects" element={<Projects />} />
        <Route path="/pm-module/projects/:id" element={<ProjectDetails />} />
        <Route path="/pm-module/tasks" element={<Tasks />} />
        <Route path="/pm-module/activities" element={<Activities />} />
        <Route path="/pm-module/support" element={<SupportPage />} />
      </Route>
      <Route path="/">
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
