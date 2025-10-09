import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

const projectsSelectRowInfoSlice = createSlice({
  name: "projects-row-info",
  initialState,
  reducers: {
    editProjectsRowInfo(state, action) {
      state.value = action.payload;
    },
  },
});

export const { editProjectsRowInfo } = projectsSelectRowInfoSlice.actions;
export default projectsSelectRowInfoSlice.reducer;
