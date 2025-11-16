import mongoose from "mongoose";
import HoaDonThanhToanModel from "../models/HoaDonThanhToanModel";

export class HoaDonService {
  async create(data: any) {
    return await HoaDonThanhToanModel.create(data);
  }

  async getAll() {
    return await HoaDonThanhToanModel.aggregate([
      {
        $addFields: {
          id_users: { $toObjectId: "$id_users" },
        },
      },
      {
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
        // Chỉ lấy các trường cần thiết
        $project: {
          ho_va_ten: "$id_users.ho_va_ten",
          ma_phong: 1,
          ma_don_hang: 1,
          so_tien: 1,
          ngay_chuyen_khoan: 1,
          trang_thai: 1,
        },
      },
    ]);
  }

  async getById(id: string) {
    const result = await HoaDonThanhToanModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $addFields: {
          id_users: { $toObjectId: "$id_users" },
        },
      },
      {
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
        $project: {
          ho_va_ten: "$id_users.ho_va_ten",
          ma_phong: 1,
          ma_don_hang: 1,
          so_tien: 1,
          ngay_chuyen_khoan: 1,
          trang_thai: 1,
          createdAt: 1,
          noi_dung: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    return result[0];
  }

  async findById(id: string) {
    return await HoaDonThanhToanModel.aggregate([
      {
        // Match the document by ma_don_hang
        $match: { ma_don_hang: id },
      },
      {
        // Convert id_users to ObjectId for joining
        $addFields: {
          id_users: { $toObjectId: "$id_users" },
        },
      },
      {
        // Join with users collection
        $lookup: {
          from: "users",
          localField: "id_users",
          foreignField: "_id",
          as: "id_users",
        },
      },
      {
        // Unwind the id_users array
        $unwind: {
          path: "$id_users",
          preserveNullAndEmptyArrays: false, // Exclude if no user found
        },
      },
      {
        // Select desired fields, including id_users
        $project: {
          ho_va_ten: "$id_users.ho_va_ten",
          id_users: "$id_users._id", // Include id_users from users collection
          ma_phong: 1,
          ma_don_hang: 1,
          so_tien: 1,
          ngay_chuyen_khoan: 1,
          trang_thai: 1,
        },
      },
    ]);
  }
}

export default new HoaDonService();
