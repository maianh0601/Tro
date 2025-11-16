import { configureStore } from "@reduxjs/toolkit";
import filterUser from "./filterUser";
import filterAdmin from "./filterAdmin";
import filterConfirmModal from "./filterConfirmModal";
import filterModalForm from "./filterModalForm";
import filterReloadSidebar from "./filterReloadSidebar";
const store = configureStore({
  reducer: {
    auth: filterUser,
    authAdmin: filterAdmin,
    confirmModal: filterConfirmModal,
    ModalForm: filterModalForm,
    sidebar: filterReloadSidebar,
  },
});
export default store;
