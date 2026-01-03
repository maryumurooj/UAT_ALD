// src/store/indexPageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeContent: "headnotes",
  scrollPosition: 0,
  judgmentData: null,
  selectedRow: null,
};

const indexPageSlice = createSlice({
  name: 'indexPage',
  initialState,
  reducers: {
    setActiveContent(state, action) {
      state.activeContent = action.payload;
    },
    setScrollPosition(state, action) {
      state.scrollPosition = action.payload;
    },
    setJudgmentData(state, action) {
      state.judgmentData = action.payload;
    },
    setSelectedRow(state, action) {
      state.selectedRow = action.payload;
    },
  },
});

export const {
  setActiveContent,
  setScrollPosition,
  setJudgmentData,
  setSelectedRow,
} = indexPageSlice.actions;

export default indexPageSlice.reducer;
