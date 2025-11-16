import { ObjectId } from "mongoose";
import HinhAnhPhongModel from "../models/HinhAnhPhongModel";

export class ImageService {
  // Tạo mới hình ảnh
  async createImage(body: any): Promise<void> {
    const { ma_phong, image_url } = body;

    const luuAnh = image_url.map((url: string) => {
      const newImage = new HinhAnhPhongModel({
        ma_phong,
        image_url: url,
      });
      return newImage.save();
    });

    // Chờ tất cả các ảnh được lưu
    await Promise.all(luuAnh);
  }

  // Cập nhật thông tin hình ảnh
  async updateImage(
    id: string,
    body: { ma_phong: string; image_url: string[] }
  ) {
    return await HinhAnhPhongModel.findByIdAndUpdate(
      id,
      {
        ma_phong: body.ma_phong,
        image_url: body.image_url,
      },
      { new: true }
    );
  }

  // Lấy danh sách tất cả hình ảnh
  async getAllImages(): Promise<any[]> {
    // Sử dụng `find()` để lấy tất cả dữ liệu hình ảnh
    const images = await HinhAnhPhongModel.find();

    // Trả về kết quả
    return images;
  }

  // Xóa tất cả hình ảnh
  async deleteAllImages(): Promise<void> {
    // Sử dụng `deleteMany()` để xóa toàn bộ dữ liệu hình ảnh
    await HinhAnhPhongModel.deleteMany();
  }

  // Xóa hình ảnh theo ID
  async deleteImageById(body: any): Promise<void> {
    const { id } = body;

    // Kiểm tra hình ảnh cần xóa có tồn tại không
    const image = await HinhAnhPhongModel.findById(id);
    if (!image) {
      throw new Error("Hình ảnh không tồn tại");
    }

    // Xóa hình ảnh
    await HinhAnhPhongModel.findByIdAndDelete(id);
  }
}
