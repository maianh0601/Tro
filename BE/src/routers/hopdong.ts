import express from "express";
import {
  checkStatusHopDong,
  createContract,
  customer,
  deleteHopDong,
  detailContract,
  extendContract,
  getHopDong,
  updateHopDong,
  yeuCauHuyHD,
} from "../controllers/hopDong";
import { accessTokenValidatetor } from "../middlewares/user.middleware";
const routerHopDong = express.Router();

routerHopDong.get("/customer", accessTokenValidatetor, customer);
routerHopDong.post("/create", accessTokenValidatetor, createContract);
routerHopDong.post(
  "/gia_han_hop_dong/:ma_phong",
  accessTokenValidatetor,
  extendContract
);
routerHopDong.get("/detail", accessTokenValidatetor, detailContract);
routerHopDong.get(
  "/checkStatus/:id",
  accessTokenValidatetor,
  checkStatusHopDong
);
routerHopDong.post("/update/:id", updateHopDong);

routerHopDong.post("/yeu_cau_huy_hd/:id", yeuCauHuyHD);
routerHopDong.delete("/delete/:id", deleteHopDong);
routerHopDong.get("/getAll", getHopDong);

export default routerHopDong;
