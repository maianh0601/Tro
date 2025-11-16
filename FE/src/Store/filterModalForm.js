import { createSlice } from "@reduxjs/toolkit";

const ModalForm = createSlice({
  name: "ModalForm",
  initialState: {
    isOpen: false,
    modalType: "",
    idModal: null,
  },
  reducers: {
    OpenModalForm: (state, action) => {
      state.isOpen = true;
      state.modalType = action.payload.modalType;
      state.idModal = action.payload.id;
    },
    CloseModalForm: (state) => {
      state.isOpen = false;
      state.modalType = "";
      state.idModal = null;
    },
  },
});
export const { OpenModalForm, CloseModalForm } = ModalForm.actions;
export default ModalForm.reducer;
