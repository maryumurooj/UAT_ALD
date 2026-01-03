// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import indexPageReducer from './indexPageSlice';

export const store = configureStore({
  reducer: {
    indexPage: indexPageReducer,
  },
});

export default store;
