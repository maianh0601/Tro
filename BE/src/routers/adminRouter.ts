import { Router } from "express";
import {
  checkAdmin,
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAllAdmin,
  loginAdmin,
  logoutAdmin,
  resetPasswordAdmin,
  sendPasswordAdmin,
  updateAdmin,
} from "../controllers/adminController";
import {
  accessTokenAdmin,
  forgotPasswordAdmin,
  LoginAdminValidator,
  ResetPasswordAdmin,
} from "../middlewares/admin.middleware";
import { validateAdminInput } from "../middlewares/validateAdminInput";

const routerAdmin = Router();

routerAdmin.post("/login", LoginAdminValidator, loginAdmin);

routerAdmin.post("/create", validateAdminInput, createAdmin);
routerAdmin.post(
  "/update/:id",
  accessTokenAdmin,
  validateAdminInput,
  updateAdmin
);
routerAdmin.delete("/delete/:id", deleteAdmin);

routerAdmin.post(
  "/resend-forgot-password",
  forgotPasswordAdmin,
  sendPasswordAdmin
);
routerAdmin.post("/reset-password", ResetPasswordAdmin, resetPasswordAdmin);
routerAdmin.post("/logout", logoutAdmin);
routerAdmin.get("/check-admin", checkAdmin);
routerAdmin.get("/getadmin", accessTokenAdmin, getAdmin);
routerAdmin.get("/getAll", getAllAdmin);

export default routerAdmin;
