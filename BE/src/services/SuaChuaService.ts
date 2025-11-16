import SuachuaModel from "../models/SuaChuaModel";

export class SuaChuaService {
  async CreateSuachua(user: any, data: any) {
    try {
      const suachua = {
        userId: user.id,
        userName: user.username,
        ma_phong: data.ma_phong,
        issue: data.issue,
      };
      return await SuachuaModel.create(suachua);
    } catch (error) {
      console.error("Error in CreateSuachua:", error);
      throw new Error("Không thể tạo sửa chữa!");
    }
  }

  async GetAllSuachua() {
    try {
      return await SuachuaModel.find().lean();
    } catch (error) {
      console.error("Error in GetAllSuachua:", error);
      throw new Error("Không thể lấy danh sách sửa chữa!");
    }
  }

  async GetSuachuaById(userId: string) {
    try {
      return (await SuachuaModel.find({ userId }).lean()) || null;
    } catch (error) {
      console.error("Error in GetSuachuaById:", error);
      throw new Error("Không thể tìm thấy sửa chữa!");
    }
  }

  async UpdateSuachua(id: string, data: object) {
    try {
      return (
        (await SuachuaModel.findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        }).lean()) || null
      );
    } catch (error) {
      console.error("Error in UpdateSuachua:", error);
      throw new Error("Không thể cập nhật sửa chữa!");
    }
  }

  async DeleteSuachua(id: string) {
    try {
      return (await SuachuaModel.findByIdAndDelete(id)) || null;
    } catch (error) {
      console.error("Error in DeleteSuachua:", error);
      throw new Error("Không thể xóa sửa chữa!");
    }
  }

  async UpdateStatus(id: string, status: string) {
    try {
      const updateData: any = { status };
      if (status === "Đang xử lý" || status === "Hoàn thành") {
        updateData.approved = "Đã phê duyệt";
      } else if (status === "Chờ xử lý") {
        updateData.approved = "Chưa phê duyệt";
      }
      return (
        (await SuachuaModel.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        }).lean()) || null
      );
    } catch (error) {
      console.error("Error in UpdateStatus:", error);
      throw new Error("Không thể cập nhật trạng thái sửa chữa!");
    }
  }
}
