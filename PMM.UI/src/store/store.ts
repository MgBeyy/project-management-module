import { configureStore } from "@reduxjs/toolkit";
import projectsFilterReducer from "../store/slices/projects-filter-slice";
import projectsSelectRowInfoSlice from "./slices/projects-select-row-info-slice";
export const store = configureStore({
  reducer: {
    projects: projectsFilterReducer,
    projectsRowInfo: projectsSelectRowInfoSlice,
  },
});
