import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "authAdmin",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loginAdmin: (state, action) => {
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logoutAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { loginAdmin, logoutAdmin } = authSlice.actions;

export default authSlice.reducer;
