import dotenv from "dotenv";
import { DanhMucService } from "../services/DanhMucService";
import DanhMucModel from "../models/DanhMucModel";
dotenv.config();

const danhMucService = new DanhMucService();

const storeDanhMuc = async (req: any, res: any) => {
  const body = req.body;
  try {
    const checkmaDanhMuc = await DanhMucModel.findOne({
      ma_danh_muc: body.ma_danh_muc,
    });
    const checkTenDanhMuc = await DanhMucModel.findOne({
      ten_danh_muc: body.ten_danh_muc,
    });
    if (checkmaDanhMuc) {
      return res.status(400).json({
        message: "Mã danh mục đã tồn tại",
      });
    }
    if (checkTenDanhMuc) {
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại",
      });
    }
    await danhMucService.createDanhMuc(body);

    res.status(200).json({
      message: "Danh mục đã được tạo thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};
const updateDanhMuc = async (req: any, res: any) => {
  try {
    const _id = req.params;
    const data = req.body;

    await danhMucService.updateDanhMuc(_id, data);

    res.status(200).json({
      message: "Danh mục đã được cập nhật thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getData = async (req: any, res: any) => {
  try {
    const data = await danhMucService.getDataDanhMuc();

    res.status(200).json({
      status: "200",
      data: data,
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const deleteAll = async (req: any, res: any) => {
  try {
    await danhMucService.deleteAllDanhMuc();
    res.status(200).json({
      status: "200",
      message: "Đã xóa tất cả danh mục thành công!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const deleteById = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await danhMucService.deleteByIdaDanhMuc({ id });

    res.status(200).json({
      status: "200",
      message: "Đã xóa thành công!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export { storeDanhMuc, updateDanhMuc, getData, deleteAll, deleteById };
