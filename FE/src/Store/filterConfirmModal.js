import { createSlice } from "@reduxjs/toolkit";

const confirmModal = createSlice({
  name: "confirmModal",
  initialState: {
    isOpen: false,
    modalType: "",
    idModal: null,
  },
  reducers: {
    openConfirmModal: (state, action) => {
      state.isOpen = true;
      state.modalType = action.payload.modalType;
      state.idModal = action.payload.id;
    },
    closeConfirmModal: (state) => {
      state.isOpen = false;
      state.modalType = "";
      state.idModal = null;
    },
  },
});

export const { openConfirmModal, closeConfirmModal } = confirmModal.actions;
export default confirmModal.reducer;
