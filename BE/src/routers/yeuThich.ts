import { authorize } from "./../middlewares/authorize.middleware";
import { accessTokenValidatetor } from "./../middlewares/user.middleware";
import { Router } from "express";

import {
  creatYeuThich,
  deleteYeuThich,
  getALLYeuThich,
  getDataYeuThich,
  getThichPhong,
} from "../controllers/YeuThich";

const router = Router();
router.post("/create", creatYeuThich);
router.delete("/delete/:id_user", deleteYeuThich);

router.get("/getdata/:id_user", getDataYeuThich);
router.get("/getAll", getALLYeuThich);
router.get("/getThichPhong/:id_user", getThichPhong);

export default router;

