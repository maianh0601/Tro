import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    reloadMessageCount: 0, // mỗi lần tăng sẽ trigger useEffect
  },
  reducers: {
    triggerReloadMessageCount: (state) => {
      state.reloadMessageCount += 1;
    },
  },
});

export const { triggerReloadMessageCount } = sidebarSlice.actions;
export default sidebarSlice.reducer;
