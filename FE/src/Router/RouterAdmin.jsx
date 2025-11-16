import LoginAdmin from "../pages/admin/LoginAdmin/loginAdmin";
import ResendForgotPassword from "../pages/admin/LoginAdmin/resend-forgot-password";
import AdminResetPassword from "../pages/admin/LoginAdmin/adminResetPassword";
import HomeAdmin from "../layout/Admin/homeAdmin";
import { Route } from "react-router";
import UserAdminDetail from "../pages/admin/home/Quanly/UserAdmin/UserAdminDetail";

const routerAdmin = (
  <Route path="/admin">
    <Route path="login" element={<LoginAdmin />} />
    <Route path="resend-forgot-password" element={<ResendForgotPassword />} />
    <Route path="reset-password" element={<AdminResetPassword />} />
    <Route path="home">
      <Route index element={<HomeAdmin />} />
      <Route path="detailUser/:id" element={<UserAdminDetail />} />
    </Route>
  </Route>
);

export default routerAdmin;
