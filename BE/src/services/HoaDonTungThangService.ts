import { ObjectId } from "mongodb";
import Electricity from "../models/Electricity";
import DichVuModel from "../models/DichVuModel";
import HoaDonTungThangModel from "../models/HoaDonTungThangModel";
import PhongTroModel from "../models/PhongTroModel";
import HoaDonThanhToanModel from "../models/HoaDonThanhToanModel";

// Hàm tính ngày đầu tháng
export function startOfMonth(dateStr: string): Date {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Hàm tính ngày cuối tháng
export function endOfMonth(dateStr: string): Date {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export class HoaDonThangService {

  async taoHoaDon(ma_phong: string, id_users: string, ngay_tao_hoa_don: string) {
    try {
      // Lấy dữ liệu điện trong tháng và sắp xếp theo timestamp giảm dần
      const electricityData = await Electricity.find({
        room_id: ma_phong,
        timestamp: {
          $gte: startOfMonth(ngay_tao_hoa_don),
          $lte: endOfMonth(ngay_tao_hoa_don),
        },
      }).sort({ timestamp: -1 });

      // Nếu không có dữ liệu điện, đặt chiSoDienThangNay = 0
      let chiSoDienThangNay = 0;
      let latestElectricity = null;
      if (electricityData.length > 0) {
        latestElectricity = electricityData[0];
        chiSoDienThangNay = latestElectricity.energy;
        console.log("latestElectricity", latestElectricity);
      } else {
        console.log(
          `Không có dữ liệu tiêu thụ điện trong tháng ${ngay_tao_hoa_don} cho phòng ${ma_phong}, sử dụng giá trị 0.`
        );
      }

      // Lấy dữ liệu dịch vụ
      const dichVu = await DichVuModel.findOne({ trang_thai: 1 });
      if (!dichVu)
        throw new Error("Không tìm thấy thông tin dịch vụ cho phòng này");

      const giaDien = dichVu.tien_dien ?? 0;
      const tienNuoc = dichVu.tien_nuoc ?? 0;
      const tienWifi = dichVu.tien_wifi ?? 0;

      // Lấy thông tin phòng trọ theo ma_phong
      const phongTro = await PhongTroModel.findOne({ ma_phong });
      if (!phongTro) {
        throw new Error(`Không tìm thấy thông tin phòng trọ với mã ${ma_phong}`);
      }
      const tienPhong = phongTro.gia_tien;

      // Lấy chỉ số điện tháng trước
      const previousMonth = new Date(startOfMonth(ngay_tao_hoa_don));
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const hoaDonThangTruoc = await HoaDonTungThangModel.findOne({
        ma_phong,
        ngay_tao_hoa_don: {
          $gte: startOfMonth(previousMonth.toISOString()),
          $lte: endOfMonth(previousMonth.toISOString()),
        },
      }).sort({ ngay_tao_hoa_don: -1 });

      const chiSoDienThangTruoc = hoaDonThangTruoc?.chi_so_dien_thang_nay || 0;

      // Tính số điện tiêu thụ và kiểm tra
      const soDienTieuThu = chiSoDienThangNay - chiSoDienThangTruoc;
      if (soDienTieuThu < 0) {
        throw new Error(
          "Số điện tiêu thụ không hợp lệ (âm), kiểm tra lại chỉ số điện"
        );
      }

      const tienDien = soDienTieuThu * giaDien;
      const tongTien = tienPhong + tienDien + tienNuoc + tienWifi;

      // Tạo hóa đơn
      const hoaDon = new HoaDonTungThangModel({
        ma_hoa_don_thang: "HD" + Math.floor(Math.random() * 1000000),
        ma_phong,
        id_users,
        chi_so_dien_thang_nay: chiSoDienThangNay,
        chi_so_dien_thang_truoc: chiSoDienThangTruoc,
        so_dien_tieu_thu: soDienTieuThu,
        tien_dien: tienDien,
        tien_phong: tienPhong,
        dich_vu: dichVu._id,
        electricity_data: latestElectricity ? [latestElectricity._id] : [],
        ngay_tao_hoa_don: new Date(ngay_tao_hoa_don),
        tong_tien: Number(tongTien.toFixed(0)),
      });

      await hoaDon.save();
      return hoaDon;
    } catch (error) {
      throw new Error(
        `Lỗi khi tạo hóa đơn: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getDataHoaDon() {
    return await HoaDonTungThangModel.aggregate([
      {
        // Chuyển id_users và dich_vu (string) thành ObjectId
        $addFields: {
          id_users: { $toObjectId: "$id_users" },
          dich_vu: { $toObjectId: "$dich_vu" }, // Chuyển dich_vu thành ObjectId
        },
      },
      {
        // Lookup để lấy thông tin users
        $lookup: {
          from: "users",
          localField: "id_users",
          foreignField: "_id",
          as: "id_users",
        },
      },
      {
        $unwind: {
          path: "$id_users",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        // Lookup để lấy thông tin dich_vu
        $lookup: {
          from: "dich_vus", // Tên collection của dịch vụ
          localField: "dich_vu",
          foreignField: "_id",
          as: "dich_vu",
        },
      },
      {
        $unwind: {
          path: "$dich_vu",
          preserveNullAndEmptyArrays: false, // true nếu muốn giữ bản ghi khi không có dịch vụ
        },
      },
      {
        // Chỉ lấy các trường cần thiết
        $project: {
          ma_hoa_don_thang: 1,
          id_user: "$id_users._id",
          ho_va_ten: "$id_users.ho_va_ten",
          ma_phong: 1,
          dich_vu: 1,
          so_dien_tieu_thu: 1,
          tien_dien: 1,
          tien_phong: 1,
          chi_so_dien_thang_nay: 1,
          chi_so_dien_thang_truoc: 1,
          tong_tien: 1,
          trang_thai: 1,
          ngay_tao_hoa_don: 1,
        },
      },
    ]);
  }

  async getUserHoaDon(id_user: string): Promise<any[]> {
    const id = new ObjectId(id_user);

    // 1. Lấy tất cả hóa đơn của người dùng
    const hoaDonThang = await HoaDonTungThangModel.find({ id_users: id });

    if (!hoaDonThang || hoaDonThang.length === 0) {
      return [];
    }

    // 2. Tạo danh sách room_id và khoảng thời gian từ hóa đơn
    const roomIdsWithDates = hoaDonThang
      .map((hoaDon) => ({
        room_id: hoaDon.ma_phong,
        ngay_tao_hoa_don: new Date(hoaDon.ngay_tao_hoa_don),
      }))
      .filter((item) => item.room_id); // Loại bỏ room_id không hợp lệ

    // 3. Lấy dữ liệu điện năng chênh lệch theo từng ngày cho các room_id và thời gian
    const dienNangChenhLech = await this.getDienNangChenhLech(roomIdsWithDates);

    // 4. Kết hợp dữ liệu hóa đơn với dữ liệu điện năng chênh lệch
    const result = hoaDonThang.map((hoaDon) => {
      const roomId = hoaDon.ma_phong;
      const hoaDonDate = new Date(hoaDon.ngay_tao_hoa_don);
      const dienNangTheoPhong = dienNangChenhLech.filter(
        (item) =>
          item.room_id === roomId &&
          new Date(item.date).getMonth() === hoaDonDate.getMonth() &&
          new Date(item.date).getFullYear() === hoaDonDate.getFullYear()
      );

      return {
        ...hoaDon.toObject(),
        dienNangChenhLech:
          dienNangTheoPhong.length > 0 ? dienNangTheoPhong : null,
      };
    });

    return result;
  }

  // Hàm lấy dữ liệu điện năng chênh lệch theo từng ngày dựa trên room_id và ngay_tao_hoa_don
  async getDienNangChenhLech(
    roomIdsWithDates: { room_id: string; ngay_tao_hoa_don: Date }[]
  ): Promise<any[]> {
    if (!roomIdsWithDates || roomIdsWithDates.length === 0) {
      return [];
    }

    // Tạo danh sách room_id duy nhất
    const roomIds = [...new Set(roomIdsWithDates.map((item) => item.room_id))];

    // Xác định khoảng thời gian tối thiểu và tối đa từ tất cả ngay_tao_hoa_don
    const dates = roomIdsWithDates.map((item) => item.ngay_tao_hoa_don);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Lấy dữ liệu điện năng trong khoảng thời gian liên quan
    const dienNangTheoNgay = await Electricity.aggregate([
      {
        $match: {
          room_id: { $in: roomIds },
          timestamp: {
            $gte: new Date(minDate.getFullYear(), minDate.getMonth(), 1), // Đầu tháng của ngày sớm nhất
            $lte: new Date(
              maxDate.getFullYear(),
              maxDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            ), // Cuối tháng của ngày muộn nhất
          },
        },
      },
      {
        $group: {
          _id: {
            room_id: "$room_id",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          totalEnergy: { $sum: "$energy" },
          totalCost: { $sum: "$total_cost" },
          latestTimestamp: { $max: "$timestamp" },
        },
      },
      {
        $sort: { latestTimestamp: 1 }, // Sắp xếp theo thời gian tăng dần để tính chênh lệch
      },
      {
        $project: {
          room_id: "$_id.room_id",
          date: "$_id.date",
          energy: "$totalEnergy",
          total_cost: "$totalCost",
          timestamp: "$latestTimestamp",
          _id: 0,
        },
      },
    ]);

    // Tính chênh lệch điện năng theo từng ngày
    const dienNangChenhLech: {
      room_id: string;
      date: string;
      energy: number;
      total_cost: number;
      timestamp: Date;
    }[] = [];
    const roomDataMap = new Map<string, any[]>();

    // Nhóm dữ liệu theo room_id
    dienNangTheoNgay.forEach((item) => {
      if (!roomDataMap.has(item.room_id)) {
        roomDataMap.set(item.room_id, []);
      }
      roomDataMap.get(item.room_id)!.push(item);
    });

    // Tính chênh lệch cho từng room_id
    roomDataMap.forEach((dailyData, roomId) => {
      for (let i = 0; i < dailyData.length; i++) {
        const currentDay = dailyData[i];
        const previousDay = i > 0 ? dailyData[i - 1] : null;
        const energyDiff = previousDay
          ? currentDay.energy - previousDay.energy
          : currentDay.energy; // Nếu không có ngày trước, giữ nguyên energy

        dienNangChenhLech.push({
          room_id: roomId,
          date: currentDay.date,
          energy: energyDiff,
          total_cost: currentDay.total_cost,
          timestamp: currentDay.timestamp,
        });
      }
    });

    return dienNangChenhLech.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Cập nhật thông tin danh mục
  async updateData(_id: any, data: any): Promise<void> {
    const id = new ObjectId(_id);
    const {
      ma_phong,
      id_users,
      chi_so_dien_thang_nay,
      chi_so_dien_thang_truoc,
      so_dien_tieu_thu,
      tien_dien,
      tien_phong,
      dich_vu,
      tong_tien,
      trang_thai,
      ngay_tao_hoa_don,
    } = data;

    const hoaDon = await HoaDonTungThangModel.findById(id);
    if (!hoaDon) {
      throw new Error("Hóa đơn không tồn tại");
    }

    hoaDon.ma_phong = ma_phong ?? hoaDon.ma_phong;
    hoaDon.id_users = id_users ?? hoaDon.id_users;
    hoaDon.chi_so_dien_thang_nay =
      chi_so_dien_thang_nay ?? hoaDon.chi_so_dien_thang_nay;
    hoaDon.chi_so_dien_thang_truoc =
      chi_so_dien_thang_truoc ?? hoaDon.chi_so_dien_thang_truoc;
    hoaDon.so_dien_tieu_thu = so_dien_tieu_thu ?? hoaDon.so_dien_tieu_thu;
    hoaDon.tien_dien = tien_dien ?? hoaDon.tien_dien;
    hoaDon.tien_phong = tien_phong ?? hoaDon.tien_phong;
    hoaDon.tong_tien = tong_tien ?? hoaDon.tong_tien;
    hoaDon.trang_thai = trang_thai ?? hoaDon.trang_thai;
    hoaDon.ngay_tao_hoa_don = ngay_tao_hoa_don ?? hoaDon.ngay_tao_hoa_don;

    await hoaDon.save();
  }

  async deleteByIdHoaDon(body: any): Promise<void> {
    const { id } = body;
    const danhMuc = await HoaDonTungThangModel.findById(id);
    if (!danhMuc) {
      throw new Error("Hóa đơn không tồn tại");
    }
    await HoaDonTungThangModel.findByIdAndDelete(id);
  }

  async findById(id: string) {
    return await HoaDonTungThangModel.aggregate([
      {
        // Phù hợp với tài liệu bằng ma_hoa_don_thang
        $match: { ma_hoa_don_thang: id },
      },
      {
        // Chuyển id_users và dich_vu (string) thành ObjectId
        $addFields: {
          id_users: { $toObjectId: "$id_users" },
          dich_vu: { $toObjectId: "$dich_vu" }, // Chuyển dich_vu thành ObjectId
        },
      },
      {
        // Lookup để lấy thông tin users
        $lookup: {
          from: "users",
          localField: "id_users",
          foreignField: "_id",
          as: "id_users",
        },
      },
      {
        $unwind: {
          path: "$id_users",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        // Lookup để lấy thông tin dich_vu
        $lookup: {
          from: "dich_vus", // Tên collection của dịch vụ
          localField: "dich_vu",
          foreignField: "_id",
          as: "dich_vu",
        },
      },
      {
        $unwind: {
          path: "$dich_vu",
          preserveNullAndEmptyArrays: false, // true nếu muốn giữ bản ghi khi không có dịch vụ
        },
      },
      {
        // Chỉ lấy các trường cần thiết
        $project: {
          ma_hoa_don_thang: 1,
          id_user: "$id_users._id",
          ho_va_ten: "$id_users.ho_va_ten",
          ma_phong: 1,
          dich_vu: 1,
          so_dien_tieu_thu: 1,
          tien_dien: 1,
          tien_phong: 1,
          chi_so_dien_thang_nay: 1,
          chi_so_dien_thang_truoc: 1,
          tong_tien: 1,
          trang_thai: 1,
          ngay_tao_hoa_don: 1,
        },
      },
    ]);
  }
}

export default HoaDonThangService;
