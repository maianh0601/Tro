import { Router } from "express";
import {
  checkPhong,
  deleteAll,
  deleteById,
  detailRoom,
  getData,
  getPhongTroByMap,
  storePhongTro,
  updatePhongTro,
} from "../controllers/phongTro";
import { accessTokenAdmin } from "../middlewares/admin.middleware";
import { authorize } from "../middlewares/authorize.middleware";

const routerPhong = Router();

routerPhong.post(
  "/create",
  accessTokenAdmin,
  authorize("67d8dc57b2276a21455150e3"),
  storePhongTro
);
routerPhong.post(
  "/update/:ma_phong",
  accessTokenAdmin,
  authorize("67d8dce7b2276a21455150e4"),
  updatePhongTro
);
routerPhong.get("/getAll", getData);
routerPhong.delete(
  "/delete/all",
  accessTokenAdmin,
  authorize("67d8dd9db2276a21455150e8"),
  deleteAll
);
routerPhong.delete(
  "/delete/:ma_phong",
  accessTokenAdmin,
  authorize("67d8dd66b2276a21455150e7"),
  deleteById
);
routerPhong.get("/checkCoc/:id_user", checkPhong);
routerPhong.post("/detail/:ma_phong", detailRoom);
//lấy phòng theo mã map
routerPhong.post("/getPhongByMaMap/:ma_map", getPhongTroByMap);
export default routerPhong;
