import express from "express";
import {
  deleteHoaDonByID,
  getByIdHoaDon,
  getHoaDon,
  getHoaDonUser,
  taoHoaDon,
  updateHoaDon,
} from "../controllers/HoaDonTungThangController";

const routerThang = express.Router();

routerThang.post("/create", taoHoaDon);

routerThang.get("/getAll", getHoaDon);
routerThang.get("/getHDUser/:id_user", getHoaDonUser);

routerThang.post("/update/:id", updateHoaDon);
routerThang.delete("/delete/:id", deleteHoaDonByID);
routerThang.get("/get-detail/:id", getByIdHoaDon);

export default routerThang;
