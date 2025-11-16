import { ObjectId } from "mongodb";
import yeuthichModel from "../models/YeuThichModel";

export class YeuThichSevice {
  async createYeuThich(body: any): Promise<void> {
    const data = body;

    const newYeuThich = new yeuthichModel({
      ma_phong: data.ma_phong,
      id_user: data.id_user,
    });
    await newYeuThich.save();
  }

  async deleteById(id_user: ObjectId): Promise<void> {
    const deleteYeuThich = await yeuthichModel.findOne({ id_user });
    if (!deleteYeuThich) {
      throw new Error("Không tìm thấy mục yêu thích của người dùng này");
    }
    await yeuthichModel.deleteOne({ id_user });
  }

  async getDataYeuTich(id_user: string): Promise<any[]> {
    const id = new ObjectId(id_user);

    const result = await yeuthichModel.aggregate([
      {
        $match: { id_user: id },
      },
      {
        $lookup: {
          from: "phongtros",
          localField: "ma_phong",
          foreignField: "ma_phong",
          as: "phongTro_yeu_thich",
        },
      },
      {
        $lookup: {
          from: "maps",
          localField: "phongTro_yeu_thich.ma_map",
          foreignField: "ma_map",
          as: "mapDetail",
        },
      },
      {
        $unwind: "$phongTro_yeu_thich",
      },
      {
        $project: {
          ma_phong: 1,
          id_user: 1,
          phongTro_yeu_thich: {
            ma_phong: "$phongTro_yeu_thich.ma_phong",
            id_users: "$_id",
            ten_phong_tro: "$phongTro_yeu_thich.ten_phong_tro",
            dia_chi: "$phongTro_yeu_thich.dia_chi",
            anh_phong: "$phongTro_yeu_thich.anh_phong",
            mo_ta: "$phongTro_yeu_thich.mo_ta",
            dien_tich: "$phongTro_yeu_thich.dien_tich",
            gia_tien: "$phongTro_yeu_thich.gia_tien",
            trang_thai: "$phongTro_yeu_thich.trang_thai",
            so_luong_nguoi: "$phongTro_yeu_thich.so_luong_nguoi",
            createdAt: "$phongTro_yeu_thich.createdAt",
            updatedAt: "$phongTro_yeu_thich.updatedAt",
            __v: "$phongTro_yeu_thich.__v",
            mapDetail: { $arrayElemAt: ["$mapDetail", 0] },
          },
        },
      },
      {
        $group: {
          _id: "$id_user",
          phongTro_yeu_thich: { $addToSet: "$phongTro_yeu_thich" }, // Loại bỏ trùng lặp
        },
      },
      {
        $project: {
          _id: 0, // Ẩn `_id`
          phongTro_yeu_thich: 1,
        },
      },
    ]);

    return result.length > 0 ? result[0].phongTro_yeu_thich : [];
  }

  async getAllYeuTich(): Promise<any[]> {
    return await yeuthichModel.aggregate([
      {
        $addFields: {
          id_users_obj: { $toObjectId: "$id_user" },
        },
      },
      {
        $lookup: {
          from: "phongtros",
          localField: "ma_phong",
          foreignField: "ma_phong",
          as: "phongTro_yeu_thich",
        },
      },
      {
        $unwind: {
          path: "$phongTro_yeu_thich",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "id_users_obj",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: {
          path: "$user_info",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          ma_phong: 1,
          id_user: 1,
          username: "$user_info.username",
        },
      },
    ]);
  }

  async isYeuThich(id_user: string, ma_phong: string): Promise<boolean> {
    const result = await yeuthichModel.findOne({
      id_user: new ObjectId(id_user),
      ma_phong: ma_phong,
    });

    return !!result; // Trả về true nếu tìm thấy, false nếu không
  }
}

const YeuThich = new YeuThichSevice();
export default YeuThich;
