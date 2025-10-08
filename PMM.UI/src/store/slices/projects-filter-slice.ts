import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    addProjectFilter(state, action) {
      state.value = action.payload;
    },
  },
});

export const { addProjectFilter } = projectsSlice.actions;
export default projectsSlice.reducer;
