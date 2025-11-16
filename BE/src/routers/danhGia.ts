import { Router } from "express";
const routerDanhGia = Router();
import { accessTokenValidatetor } from "../middlewares/user.middleware";
import {
  createDanhGia,
  DeleteDanhGia,
  getDataDanhGia,
  Topdanhgia,
} from "../controllers/danhGiaController";

routerDanhGia.post('/createdanhgia',accessTokenValidatetor, createDanhGia);
routerDanhGia.get('/getdanhgia/:ma_phong', getDataDanhGia);
routerDanhGia.post('/deletedanhgia/:id',accessTokenValidatetor, DeleteDanhGia);
routerDanhGia.get('/AllTopdanhgia', Topdanhgia);  
export default routerDanhGia;

