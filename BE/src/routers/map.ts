import { Router } from "express";
const mapRoutes = Router();
import { CreateMap, DeleteMap, GetAllMap, UpdateMap } from "../controllers/map";
import { accessTokenAdmin } from "../middlewares/admin.middleware";
import { authorize } from "../middlewares/authorize.middleware";

mapRoutes.post("/creatMap",accessTokenAdmin,CreateMap); // Tạo mới bản đồ
mapRoutes.get("/AllMap",accessTokenAdmin,GetAllMap); // Lấy tất cả bản đồ
mapRoutes.post("/updateMap/:id",accessTokenAdmin, UpdateMap); // Cập nhật bản đồ
mapRoutes.delete("/deleteMap/:id",accessTokenAdmin, DeleteMap); // Xóa bản đồ

export default mapRoutes;
