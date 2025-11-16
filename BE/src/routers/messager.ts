import { Router } from "express";
import {
  demtinnhanController,
  doctinnhanController,
  getAllMessAdmin,
  getMessUser,
  getSeenMessAdminoneUser,
  getUnreadMessagesForAdmin,
  sumMessAdmin,
} from "../controllers/messagerControllers";
import { accessTokenValidatetor } from "../middlewares/user.middleware";
import { accessTokenAdmin } from "../middlewares/admin.middleware";

const routerMess = Router();

// routerMess.get("/mess/:id_nguoi_nhan", accessTokenValidatetor, getAllMess);
routerMess.get("/messAdmin/:id_nguoi_nhan", accessTokenAdmin, getAllMessAdmin);
routerMess.get("/messs", accessTokenValidatetor, getMessUser);

//đếm tin nhắn chưa đọc của admin với từng user
routerMess.get("/unread-count", accessTokenAdmin, getUnreadMessagesForAdmin);
//đếm tin nhắn tổng user nhắn cho admin
routerMess.get("/tin-nhan-tong", accessTokenAdmin, sumMessAdmin);
routerMess.get(
  "/seenmess/:id_nguoi_nhan",
  accessTokenAdmin,
  getSeenMessAdminoneUser
);
//đếm tin nhắn chưa đọc
routerMess.get("/dem-tin-nhan", accessTokenValidatetor, demtinnhanController);

// Đánh dấu tin nhắn đã đọc
routerMess.get("/doc-tin-nhan", accessTokenValidatetor, doctinnhanController);

export default routerMess;
