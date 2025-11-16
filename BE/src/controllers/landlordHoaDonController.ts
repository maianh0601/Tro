import { Response } from "express";
import HoaDonThanhToanModel from "../models/HoaDonThanhToanModel";
import HoaDonTungThangModel from "../models/HoaDonTungThangModel";
import PhongTroModel from "../models/PhongTroModel";

// Helper: Kiểm tra phòng thuộc landlord
const validateRoomOwnership = async (ma_phong: string, landlordId: string): Promise<boolean> => {
  const room = await PhongTroModel.findOne({ ma_phong, id_chu_tro: landlordId });
  return !!room;
};

// ============= HÓA ĐƠN CỌC =============

// Lấy tất cả hóa đơn cọc của phòng landlord
export const getLandlordHoaDonCoc = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();

    // Lấy danh sách mã phòng của landlord
    const rooms = await PhongTroModel.find({ id_chu_tro: landlordId }).select("ma_phong");
    const roomCodes = rooms.map(room => room.ma_phong);

    // Lấy hóa đơn cọc kèm thông tin user
    const hoaDons = await HoaDonThanhToanModel.aggregate([
      { $match: { ma_phong: { $in: roomCodes } } },
      {
        $lookup: {
          from: "users",
          localField: "id_users",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          ma_phong: 1,
          id_users: 1,
          so_tien: 1,
          noi_dung: 1,
          ma_don_hang: 1,
          trang_thai: 1,
          ngay_chuyen_khoan: 1,
          createdAt: 1,
          updatedAt: 1,
          ho_va_ten: "$userInfo.ho_va_ten"
        }
      }
    ]);

    res.status(200).json({
      status: "200",
      data: hoaDons,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Chi tiết hóa đơn cọc
export const getLandlordHoaDonCocDetail = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    const hoaDon = await HoaDonThanhToanModel.findById(id)
      .populate('id_users', 'ho_va_ten username email');
    
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền xem hóa đơn này!" });
    }

    res.status(200).json(hoaDon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái hóa đơn cọc
export const updateLandlordHoaDonCocStatus = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!trang_thai) {
      return res.status(400).json({ message: "Thiếu trường trang_thai" });
    }

    const hoaDon = await HoaDonThanhToanModel.findById(id);
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật hóa đơn này!" });
    }

    hoaDon.trang_thai = trang_thai;
    if (trang_thai === "đã thanh toán") {
      hoaDon.ngay_chuyen_khoan = new Date();
      // Cập nhật phòng
      await PhongTroModel.findOneAndUpdate(
        { ma_phong: hoaDon.ma_phong },
        { id_users: hoaDon.id_users, trang_thai: 0 },
        { new: true }
      );
    }

    await hoaDon.save();

    res.status(200).json({ message: "Cập nhật trạng thái thành công", data: hoaDon });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa hóa đơn cọc
export const deleteLandlordHoaDonCoc = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    const hoaDon = await HoaDonThanhToanModel.findById(id);
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền xóa hóa đơn này!" });
    }

    await HoaDonThanhToanModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa hóa đơn thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ============= HÓA ĐƠN THÁNG =============

// Lấy tất cả hóa đơn tháng của phòng landlord
export const getLandlordHoaDonThang = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();

    // Lấy danh sách mã phòng của landlord
    const rooms = await PhongTroModel.find({ id_chu_tro: landlordId }).select("ma_phong");
    const roomCodes = rooms.map(room => room.ma_phong);

    // Lấy hóa đơn tháng
    const hoaDons = await HoaDonTungThangModel.find({ ma_phong: { $in: roomCodes } })
      .populate('id_users', 'ho_va_ten username email')
      .sort({ ngay_tao_hoa_don: -1 });

    res.status(200).json({
      status: "200",
      data: hoaDons,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Chi tiết hóa đơn tháng
export const getLandlordHoaDonThangDetail = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    const hoaDon = await HoaDonTungThangModel.findById(id)
      .populate('id_users', 'ho_va_ten username email');
    
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền xem hóa đơn này!" });
    }

    res.status(200).json({
      status: "200",
      data: hoaDon,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật hóa đơn tháng
export const updateLandlordHoaDonThang = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;
    const updateData = req.body;

    const hoaDon = await HoaDonTungThangModel.findById(id);
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật hóa đơn này!" });
    }

    // Nếu đổi mã phòng, validate mã phòng mới
    if (updateData.ma_phong && updateData.ma_phong !== hoaDon.ma_phong) {
      const isOwnerNew = await validateRoomOwnership(updateData.ma_phong, landlordId);
      if (!isOwnerNew) {
        return res.status(403).json({ message: "Bạn không có quyền chuyển hóa đơn sang phòng này!" });
      }
    }

    const updatedHoaDon = await HoaDonTungThangModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Cập nhật hóa đơn thành công",
      data: updatedHoaDon,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa hóa đơn tháng
export const deleteLandlordHoaDonThang = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    const hoaDon = await HoaDonTungThangModel.findById(id);
    if (!hoaDon || !hoaDon.ma_phong) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    // Validate phòng thuộc landlord
    const isOwner = await validateRoomOwnership(hoaDon.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({ message: "Bạn không có quyền xóa hóa đơn này!" });
    }

    await HoaDonTungThangModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "200",
      message: "Xóa hóa đơn thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

