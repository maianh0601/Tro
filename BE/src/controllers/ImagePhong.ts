import { Request, Response } from "express";
import { ImageService } from "../services/ImagePhongService";

const imageService = new ImageService();

const createImage = async (req: Request, res: Response) => {
  const { ma_phong, image_url } = req.body;
  try {
    await imageService.createImage({ ma_phong, image_url });

    res.status(200).json({
      message: "Hình ảnh đã được tạo thành công",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ma_phong, image_url } = req.body;

  // Kiểm tra đầu vào cơ bản
  if (!ma_phong || !image_url) {
    return res.status(400).json({
      message: "Thiếu thông tin ma_phong hoặc image_url",
    });
  }

  try {
    const updatedImage = await imageService.updateImage(id, {
      ma_phong,
      image_url,
    });

    if (!updatedImage) {
      return res.status(404).json({
        message: "Không tìm thấy hình ảnh với ID đã cho",
      });
    }

    res.status(200).json({
      message: "Hình ảnh đã được cập nhật thành công",
      data: updatedImage,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi cập nhật hình ảnh",
      error: error.message,
    });
  }
};

const getAllImages = async (req: Request, res: Response) => {
  try {
    const images = await imageService.getAllImages();

    res.status(200).json({
      status: "200",
      data: images,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteAllImages = async (req: Request, res: Response) => {
  try {
    await imageService.deleteAllImages();

    res.status(200).json({
      status: "200",
      message: "Tất cả hình ảnh đã được xóa thành công!",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteImageById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await imageService.deleteImageById({ id });

    res.status(200).json({
      status: "200",
      message: "Hình ảnh đã được xóa thành công!",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export {
  createImage,
  updateImage,
  getAllImages,
  deleteAllImages,
  deleteImageById,
};
