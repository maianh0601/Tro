import { Request, Response } from "express";
import { PhongtroService } from "../services/PhongTroService";
import PhongTroModel from "../models/PhongTroModel";
import {
  normalizeImageList,
  syncRoomImages,
} from "../utils/roomImageHelper";

const phongTroService = new PhongtroService();

const storePhongTro = async (req: Request, res: Response) => {
  try {
    const { ma_phong, anh_phong: rawImages, ...rest } = req.body;

    if (await PhongTroModel.findOne({ ma_phong })) {
      return res
        .status(400)
        .json({ message: "Mã phòng đã tồn tại, vui lòng chọn mã khác." });
    }

    const imageList = normalizeImageList(rawImages);

    const newPhongTro = await phongTroService.createPhongTro({
      ma_phong,
      ...rest,
      anh_phong: imageList[0] || rawImages,
    });

    if (imageList.length) {
      await syncRoomImages(ma_phong, imageList);
    }

    res
      .status(201)
      .json({ message: "Tạo phòng trọ thành công!", data: newPhongTro });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi tạo phòng trọ!", error: error.message });
  }
};

const updatePhongTro = async (req: Request, res: Response) => {
  try {
    const { ma_phong } = req.params;
    if (!ma_phong) {
      return res
        .status(400)
        .json({ message: "Mã phòng là bắt buộc để cập nhật." });
    }

    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      danh_muc,
      mapDetail,
      anh_phong: rawImages,
      ...updateData
    } = req.body;

    const hasImagePayload = Object.prototype.hasOwnProperty.call(
      req.body,
      "anh_phong"
    );
    const normalizedImages = hasImagePayload
      ? normalizeImageList(rawImages)
      : [];

    if (hasImagePayload) {
      updateData.anh_phong = normalizedImages[0] || "";
    }

    const updatedPhongTro = await phongTroService.updatePhongTro(
      ma_phong,
      updateData
    );

    if (!updatedPhongTro) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy phòng trọ để cập nhật." });
    }

    if (hasImagePayload) {
      await syncRoomImages(ma_phong, normalizedImages);
    }

    res.status(200).json({
      message: "Cập nhật phòng trọ thành công!",
      data: updatedPhongTro,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật phòng trọ.", error: error.message });
  }
};


const getData = async (req: Request, res: Response) => {
  try {
    const data = await phongTroService.getAllPhongTro();
    res.status(200).json({
      message: "Lấy danh sách phòng trọ thành công!",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phòng trọ.",
      error: error.message,
    });
  }
};

const deleteAll = async (req: Request, res: Response) => {
  try {
    await phongTroService.deleteAllPhongTro();
    res.status(200).json({ message: "Xóa tất cả phòng trọ thành công!" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa tất cả phòng trọ.", error: error.message });
  }
};

const deleteById = async (req: Request, res: Response) => {
  try {
    const { ma_phong } = req.params;

    if (!ma_phong) {
      return res.status(400).json({ message: "Mã phòng là bắt buộc để xóa." });
    }

    const deletedPhongTro = await phongTroService.deletePhongTroById(ma_phong);

    if (!deletedPhongTro) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy phòng trọ để xóa." });
    }

    res
      .status(200)
      .json({ message: "Xóa phòng trọ thành công!", data: deletedPhongTro });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa phòng trọ.", error: error.message });
  }
};

const detailRoom = async (req: Request, res: Response) => {
  try {
    const { ma_phong } = req.params;
    const data = await phongTroService.getDetailPhongTro(ma_phong);
    res.status(200).json({
      message: "Lấy chi tiết danh sách phòng trọ thành công!",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phòng trọ.",
      error: error.message,
    });
  }
};
const getPhongTroByMap = async (req: Request, res: Response) => {
  try {
    const { ma_map } = req.params;
    const data = await phongTroService.getPhongTroByMap(ma_map);
    res.status(200).json({
      message: "Lấy danh sách phòng trọ theo mã map thành công!",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách phòng trọ.",
      error: error.message,
    });
  }
};

const checkPhong = async (req: Request, res: Response) => {
  try {
    const { id_user } = req.params;
    const data = await phongTroService.checkPhongTro(id_user);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi kiểm tra phòng trọ.",
    });
  }
};

export {
  storePhongTro,
  updatePhongTro,
  getData,
  deleteAll,
  deleteById,
  detailRoom,
  getPhongTroByMap,
  checkPhong,
};
