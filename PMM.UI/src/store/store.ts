import { configureStore } from "@reduxjs/toolkit";
import projectsFilterReducer from "../store/slices/projects-filter-slice";

export const store = configureStore({
  reducer: {
    projects: projectsFilterReducer,
  },
});
