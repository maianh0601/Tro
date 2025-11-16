import { ObjectId } from "mongodb";
import YeuThich, { YeuThichSevice } from "../services/YeuThichService";

const yeuThichService = new YeuThichSevice();

export const creatYeuThich = async (req: any, res: any) => {
  const data = req.body;
  await YeuThich.createYeuThich(data);
  res.status(200).json({
    message: "Đã thêm vào yêu thích!!",
  });
};

export const deleteYeuThich = async (req: any, res: any) => {
  try {
    const { id_user } = req.params;
    await yeuThichService.deleteById(id_user);
    res.status(200).json({
      message: "Đã hủy bỏ yêu thích!!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Có lỗi xảy ra khi xóa mục yêu thích",
    });
  }
};

export const getDataYeuThich = async (req: any, res: any) => {
  try {
    const { id_user } = req.params;

    const data = await yeuThichService.getDataYeuTich(id_user);

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

export const getALLYeuThich = async (req: any, res: any) => {
  try {
    const data = await yeuThichService.getAllYeuTich();

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

export const getThichPhong = async (req: any, res: any) => {
  try {
    const { ma_phong } = req.query;
    const { id_user } = req.params;
    if (!id_user || !ma_phong) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin id_user hoặc ma_phong" });
    }

    const isFavourite = await yeuThichService.isYeuThich(
      id_user,
      ma_phong as string
    );

    res.status(200).json({ isFavourite });
  } catch (error) {
    res.status(404).json({
      message: error,
    });
  }
};
