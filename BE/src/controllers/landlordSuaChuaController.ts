import { Response } from "express";
import SuachuaModel from "../models/SuaChuaModel";
import PhongTroModel from "../models/PhongTroModel";

// Kiểm tra phòng có thuộc về landlord không
const validateRoomOwnership = async (ma_phong: string, landlordId: string): Promise<boolean> => {
  const room = await PhongTroModel.findOne({ ma_phong, id_chu_tro: landlordId });
  return !!room;
};

// Lấy tất cả yêu cầu sửa chữa của phòng landlord
export const getLandlordSuaChua = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();

    // Lấy danh sách mã phòng của landlord
    const rooms = await PhongTroModel.find({ id_chu_tro: landlordId }).select("ma_phong");
    const roomCodes = rooms.map(room => room.ma_phong);

    // Lấy tất cả yêu cầu sửa chữa của các phòng đó
    const suaChuaRequests = await SuachuaModel.find({ ma_phong: { $in: roomCodes } }).lean();

    res.status(200).json({
      data: suaChuaRequests,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Tạo yêu cầu sửa chữa mới
export const createLandlordSuaChua = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { ma_phong, issue } = req.body;

    // Validate phòng thuộc về landlord
    const isOwner = await validateRoomOwnership(ma_phong, landlordId);
    if (!isOwner) {
      return res.status(403).json({
        message: "Bạn không có quyền tạo yêu cầu sửa chữa cho phòng này!",
      });
    }

    const suachua = {
      userId: user._id,
      userName: user.ho_va_ten || user.username,
      ma_phong,
      issue,
    };

    const newSuaChua = await SuachuaModel.create(suachua);

    res.status(200).json({
      suaChua: newSuaChua,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Cập nhật yêu cầu sửa chữa
export const updateLandlordSuaChua = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;
    const data = req.body;

    // Kiểm tra yêu cầu có tồn tại không
    const existingSuaChua = await SuachuaModel.findById(id);
    if (!existingSuaChua || !existingSuaChua.ma_phong) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu sửa chữa!",
      });
    }

    // Validate phòng cũ thuộc về landlord
    const isOwnerOld = await validateRoomOwnership(existingSuaChua.ma_phong as string, landlordId);
    if (!isOwnerOld) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật yêu cầu này!",
      });
    }

    // Nếu đổi mã phòng, validate mã phòng mới cũng thuộc landlord
    if (data.ma_phong && data.ma_phong !== existingSuaChua.ma_phong) {
      const isOwnerNew = await validateRoomOwnership(data.ma_phong, landlordId);
      if (!isOwnerNew) {
        return res.status(403).json({
          message: "Bạn không có quyền chuyển yêu cầu sang phòng này!",
        });
      }
    }

    // Cập nhật
    const updatedSuaChua = await SuachuaModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      suaChua: updatedSuaChua,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Xóa yêu cầu sửa chữa
export const deleteLandlordSuaChua = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    // Kiểm tra yêu cầu có tồn tại không
    const existingSuaChua = await SuachuaModel.findById(id);
    if (!existingSuaChua || !existingSuaChua.ma_phong) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu sửa chữa!",
      });
    }

    // Validate phòng thuộc về landlord
    const isOwner = await validateRoomOwnership(existingSuaChua.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa yêu cầu này!",
      });
    }

    // Xóa
    await SuachuaModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Xóa yêu cầu sửa chữa thành công!",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Cập nhật trạng thái sửa chữa
export const updateLandlordSuaChuaStatus = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra yêu cầu có tồn tại không
    const existingSuaChua = await SuachuaModel.findById(id);
    if (!existingSuaChua || !existingSuaChua.ma_phong) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu sửa chữa!",
      });
    }

    // Validate phòng thuộc về landlord
    const isOwner = await validateRoomOwnership(existingSuaChua.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật trạng thái yêu cầu này!",
      });
    }

    // Cập nhật status và approved
    const updateData: any = { status };
    if (status === "Đang xử lý" || status === "Hoàn thành") {
      updateData.approved = "Đã phê duyệt";
    } else if (status === "Chờ xử lý") {
      updateData.approved = "Chưa phê duyệt";
    }

    const updatedSuaChua = await SuachuaModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      suaChua: updatedSuaChua,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

