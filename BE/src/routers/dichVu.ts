import { authorize } from "./../middlewares/authorize.middleware";
import { accessTokenAdmin } from "./../middlewares/admin.middleware";
import { Router } from "express";
import {
  CreateDichVu,
  DeleteDichVu,
  GetAllDichVu,
  UpdateDichVu,
} from "../controllers/dichVu";
const routeDichVu = Router();

routeDichVu.post(
  "/create",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbb9"),
  CreateDichVu
);
routeDichVu.delete(
  "/delete/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbbb"),
  DeleteDichVu
);
routeDichVu.post(
  "/update/:id",
  accessTokenAdmin,
  authorize("67b1dfa48631e4849450bbba"),
  UpdateDichVu
);
routeDichVu.get(
  "/getAll",
  // accessTokenAdmin,
  // authorize("67b1dfa48631e4849450bbb8"),
  GetAllDichVu
);

export default routeDichVu;
