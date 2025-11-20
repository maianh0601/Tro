import { Router } from "express";
import {
  registerLandlord,
  getLandlordRequests,
  approveLandlord,
  getLandlordRooms,
  getLandlordContracts,
  getLandlordTenants,
  checkLandlordStatus,
  createLandlordRoom,
  updateLandlordRoom,
  deleteLandlordRoom,
} from "../controllers/landlordController";
import {
  getLandlordYeuThichStats,
  getLandlordDanhGiaStats,
  getLandlordDienNangStats,
} from "../controllers/landlordStatsController";
import {
  getLandlordImages,
  createLandlordImage,
  updateLandlordImage,
  deleteLandlordImage,
} from "../controllers/landlordImageController";
import {
  uploadImage,
  uploadImages,
  uploadMultiple,
} from "../controllers/uploadController";
import {
  getLandlordSuaChua,
  createLandlordSuaChua,
  updateLandlordSuaChua,
  deleteLandlordSuaChua,
  updateLandlordSuaChuaStatus,
} from "../controllers/landlordSuaChuaController";
import {
  getLandlordHoaDonCoc,
  getLandlordHoaDonCocDetail,
  updateLandlordHoaDonCocStatus,
  deleteLandlordHoaDonCoc,
  getLandlordHoaDonThang,
  getLandlordHoaDonThangDetail,
  updateLandlordHoaDonThang,
  deleteLandlordHoaDonThang,
} from "../controllers/landlordHoaDonController";
import { accessTokenValidatetor } from "../middlewares/user.middleware";
import { accessTokenAdmin } from "../middlewares/admin.middleware";
import { isLandlord } from "../middlewares/landlord.middleware";

const landlordRouter = Router();

// User routes
landlordRouter.post("/register", accessTokenValidatetor, registerLandlord);
landlordRouter.get("/status", accessTokenValidatetor, checkLandlordStatus);

// Admin routes
landlordRouter.get("/requests", accessTokenAdmin, getLandlordRequests);
landlordRouter.patch("/approve/:id", accessTokenAdmin, approveLandlord);

// Landlord routes
landlordRouter.get("/my-rooms", accessTokenValidatetor, isLandlord, getLandlordRooms);
landlordRouter.post("/create-room", accessTokenValidatetor, isLandlord, createLandlordRoom);
landlordRouter.put("/update-room/:ma_phong", accessTokenValidatetor, isLandlord, updateLandlordRoom);
landlordRouter.delete("/delete-room/:ma_phong", accessTokenValidatetor, isLandlord, deleteLandlordRoom);
landlordRouter.get("/my-contracts", accessTokenValidatetor, isLandlord, getLandlordContracts);
landlordRouter.get("/my-tenants", accessTokenValidatetor, isLandlord, getLandlordTenants);

// Stats routes
landlordRouter.get("/stats/yeu-thich", accessTokenValidatetor, isLandlord, getLandlordYeuThichStats);
landlordRouter.get("/stats/danh-gia", accessTokenValidatetor, isLandlord, getLandlordDanhGiaStats);
landlordRouter.get("/stats/dien-nang", accessTokenValidatetor, isLandlord, getLandlordDienNangStats);

// Image routes
landlordRouter.get("/images", accessTokenValidatetor, isLandlord, getLandlordImages);
landlordRouter.post("/images/create", accessTokenValidatetor, isLandlord, createLandlordImage);
landlordRouter.post("/images/update/:id", accessTokenValidatetor, isLandlord, updateLandlordImage);
landlordRouter.delete("/images/delete/:id", accessTokenValidatetor, isLandlord, deleteLandlordImage);

// Upload routes
landlordRouter.post("/upload", accessTokenValidatetor, isLandlord, uploadMultiple, uploadImages);

// Sua chua routes
landlordRouter.get("/suachua", accessTokenValidatetor, isLandlord, getLandlordSuaChua);
landlordRouter.post("/suachua/create", accessTokenValidatetor, isLandlord, createLandlordSuaChua);
landlordRouter.post("/suachua/update/:id", accessTokenValidatetor, isLandlord, updateLandlordSuaChua);
landlordRouter.delete("/suachua/delete/:id", accessTokenValidatetor, isLandlord, deleteLandlordSuaChua);
landlordRouter.post("/suachua/update-status/:id", accessTokenValidatetor, isLandlord, updateLandlordSuaChuaStatus);

// Hoa don coc routes
landlordRouter.get("/hoadoncoc", accessTokenValidatetor, isLandlord, getLandlordHoaDonCoc);
landlordRouter.get("/hoadoncoc/detail/:id", accessTokenValidatetor, isLandlord, getLandlordHoaDonCocDetail);
landlordRouter.patch("/hoadoncoc/update-status/:id", accessTokenValidatetor, isLandlord, updateLandlordHoaDonCocStatus);
landlordRouter.delete("/hoadoncoc/delete/:id", accessTokenValidatetor, isLandlord, deleteLandlordHoaDonCoc);

// Hoa don thang routes
landlordRouter.get("/hoadonthang", accessTokenValidatetor, isLandlord, getLandlordHoaDonThang);
landlordRouter.get("/hoadonthang/detail/:id", accessTokenValidatetor, isLandlord, getLandlordHoaDonThangDetail);
landlordRouter.post("/hoadonthang/update/:id", accessTokenValidatetor, isLandlord, updateLandlordHoaDonThang);
landlordRouter.delete("/hoadonthang/delete/:id", accessTokenValidatetor, isLandlord, deleteLandlordHoaDonThang);

export default landlordRouter;

