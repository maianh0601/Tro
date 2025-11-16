import { Response } from "express";
import HinhAnhPhongModel from "../models/HinhAnhPhongModel";
import PhongTroModel from "../models/PhongTroModel";

// Kiểm tra phòng có thuộc về landlord không
const validateRoomOwnership = async (ma_phong: string, landlordId: string): Promise<boolean> => {
  const room = await PhongTroModel.findOne({ ma_phong, id_chu_tro: landlordId });
  return !!room;
};

// Lấy tất cả ảnh của các phòng thuộc landlord
export const getLandlordImages = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();

    // Lấy danh sách mã phòng của landlord
    const rooms = await PhongTroModel.find({ id_chu_tro: landlordId }).select("ma_phong");
    const roomCodes = rooms.map(room => room.ma_phong);

    // Lấy tất cả ảnh của các phòng đó
    const images = await HinhAnhPhongModel.find({ ma_phong: { $in: roomCodes } });

    res.status(200).json({
      status: "200",
      data: images,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Tạo ảnh mới cho phòng
export const createLandlordImage = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { ma_phong, image_url } = req.body;

    // Validate phòng thuộc về landlord
    const isOwner = await validateRoomOwnership(ma_phong, landlordId);
    if (!isOwner) {
      return res.status(403).json({
        message: "Bạn không có quyền thêm ảnh cho phòng này!",
      });
    }

    // Tạo ảnh (image_url có thể là array)
    const imagesToSave = Array.isArray(image_url) ? image_url : [image_url];
    const savedImages = imagesToSave.map((url: string) => {
      const newImage = new HinhAnhPhongModel({
        ma_phong,
        image_url: url,
      });
      return newImage.save();
    });

    await Promise.all(savedImages);

    res.status(200).json({
      message: "Hình ảnh đã được tạo thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Cập nhật ảnh
export const updateLandlordImage = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;
    const { ma_phong, image_url } = req.body;

    if (!ma_phong || !image_url) {
      return res.status(400).json({
        message: "Thiếu thông tin ma_phong hoặc image_url",
      });
    }

    // Kiểm tra ảnh có tồn tại không
    const existingImage = await HinhAnhPhongModel.findById(id);
    if (!existingImage || !existingImage.ma_phong) {
      return res.status(404).json({
        message: "Không tìm thấy hình ảnh",
      });
    }

    // Validate phòng cũ thuộc về landlord
    const isOwnerOld = await validateRoomOwnership(existingImage.ma_phong as string, landlordId);
    if (!isOwnerOld) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật ảnh này!",
      });
    }

    // Nếu đổi mã phòng, validate mã phòng mới cũng thuộc landlord
    if (ma_phong !== existingImage.ma_phong) {
      const isOwnerNew = await validateRoomOwnership(ma_phong, landlordId);
      if (!isOwnerNew) {
        return res.status(403).json({
          message: "Bạn không có quyền chuyển ảnh sang phòng này!",
        });
      }
    }

    // Cập nhật
    const updatedImage = await HinhAnhPhongModel.findByIdAndUpdate(
      id,
      { ma_phong, image_url },
      { new: true }
    );

    res.status(200).json({
      message: "Hình ảnh đã được cập nhật thành công",
      data: updatedImage,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Xóa ảnh
export const deleteLandlordImage = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const landlordId = user._id.toString();
    const { id } = req.params;

    // Kiểm tra ảnh có tồn tại không
    const existingImage = await HinhAnhPhongModel.findById(id);
    if (!existingImage || !existingImage.ma_phong) {
      return res.status(404).json({
        message: "Không tìm thấy hình ảnh",
      });
    }

    // Validate phòng thuộc về landlord
    const isOwner = await validateRoomOwnership(existingImage.ma_phong as string, landlordId);
    if (!isOwner) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa ảnh này!",
      });
    }

    // Xóa
    await HinhAnhPhongModel.findByIdAndDelete(id);

    res.status(200).json({
      status: "200",
      message: "Hình ảnh đã được xóa thành công!",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

