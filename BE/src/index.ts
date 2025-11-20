import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routers/user";
import danhMucRouter from "./routers/danhMuc";
import thietBiRouter from "./routers/thietBi";
import cors from "cors";
import cookieParser from "cookie-parser";
import YeuThichRouter from "./routers/yeuThich";
import contractRoutes from "./routers/hopdong";
import routeImage from "./routers/Image";
import routerPhong from "./routers/phongTro";
import routeDichVu from "./routers/dichVu";
import mapRoutes from "./routers/map";
import routeHoaDon from "./routers/hoaDon";
import routeChiSoDongHo from "./routers/chiSoDongHo";
import RouteQuyen from "./routers/quyen";
import QuyenChucNangRouter from "./routers/quyenChucNang";
import initSocket from "./utils/socket";
import { createServer } from "http";
import routerMess from "./routers/messager";
import routerAdmin from "./routers/adminRouter";
import { saveEndOfDayData } from "./controllers/electricityController";
import router from "./routers/TinhTienDienIOT";
import schedule from "node-schedule";
import routerDanhGia from "./routers/danhGia";
import routerSuaChua from "./routers/SuaChua";
import routerSearch from "./routers/Search";
import routerThongKe from "./routers/thongKe";
import routerThang from "./routers/HoaDonThangRouter";
import {
  tuDongTaoHoaDon,
  tuDongTaoHoaDonThang,
} from "./controllers/HoaDonTungThangController";
import OtpRouter from "./routers/otp";
import nganHangRouter from "./routers/nganHangRouter";
import routerHopDong from "./routers/hopdong";
import landlordRouter from "./routers/landlord";

dotenv.config();

const PORT = process.env.PORT || 5000;
const dbURL = `mongodb+srv://tro:tro@cluster0.ou3ro63.mongodb.net/?retryWrites=true&w=majority`;
const app = express();

const server = createServer(app);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.100.121:3000"
    ],
    // hoặc https nếu bạn bật SSL
    credentials: true, // Cho phép frontend gửi cookie, token
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Chỉ định rõ các method
    allowedHeaders: ["Content-Type", "Authorization"], // Headers cần thiết
  })
);

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use("/admin", routerAdmin);

app.use("/auth", userRouter);
app.use("/danh-muc", danhMucRouter);
app.use("/yeu-thich", YeuThichRouter);
app.use("/thiet-bi", thietBiRouter);
app.use("/Image-phong", routeImage);
app.use("/phongTro", routerPhong);
app.use("/dich-vu", routeDichVu);
app.use("/map", mapRoutes);
app.use("/hoadon", routeHoaDon);
app.use("/chi-so-dong-ho", routeChiSoDongHo);
app.use("/phan_quyen", RouteQuyen);
app.use("/quyenchucnang", QuyenChucNangRouter);

app.use("/tin-nhan", routerMess);
app.use("/danh_gia", routerDanhGia);
app.use("/sua_chua", routerSuaChua);
app.use("/api", routerSearch);
app.use("/thong-ke", routerThongKe);
app.use("/hoa-don-thang", routerThang);
app.use("/Otp", OtpRouter);

app.use("/hopdong", routerHopDong);

app.use("/ngan-hang", nganHangRouter);
app.use("/landlord", landlordRouter);

//hợp đồng
app.use("/api/contracts", contractRoutes);
const connectDB = async () => {
  try {
    await mongoose.connect(dbURL);
    console.log(`Connect to db successfully!!!`);
  } catch (error) {
    console.log(`Can not connect to db ${error}`);
  }
};

// socket
initSocket(server);
//api chạy thông tin từ ESP32
app.use("/api", router);

// Lưu dữ liệu cuối ngày
schedule.scheduleJob("10 22 * * *", saveEndOfDayData);
//*:Phút (0 - 59) *:Giờ (0 - 23) *:Ngày trong (tháng (1 - 31)) *:Tháng (1 - 12)    *:Ngày trong tuần (0 - 7) (Chủ nhật có thể là 0 hoặc 7)

schedule.scheduleJob("22 18 * * *", () => {
  tuDongTaoHoaDonThang();
  tuDongTaoHoaDon();
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is stating at http:/localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
