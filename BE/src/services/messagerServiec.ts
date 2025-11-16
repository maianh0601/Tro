import { ObjectId } from "mongodb";
import MessagersModel from "../models/MessagerModel";

class MessagersService {
  async messAll(id_nguoi_gui: string, id_nguoi_nhan: string) {
    return await MessagersModel.find({
      $or: [
        {
          nguoi_gui: new ObjectId(id_nguoi_gui),
          nguoi_nhan: new ObjectId(id_nguoi_nhan),
        },
        {
          nguoi_gui: new ObjectId(id_nguoi_nhan),
          nguoi_nhan: new ObjectId(id_nguoi_gui),
        },
      ],
    }).sort({ createdAt: 1 });
  }

  async messAllAdmin(id_nguoi_gui: string, id_nguoi_nhan: string) {
    return await MessagersModel.find({
      $or: [
        {
          nguoi_gui: new ObjectId(id_nguoi_gui),
          nguoi_nhan: new ObjectId(id_nguoi_nhan),
        },
        {
          nguoi_gui: new ObjectId(id_nguoi_nhan),
          nguoi_nhan: new ObjectId(id_nguoi_gui),
        },
      ],
    }).sort({ createdAt: 1 });
  }

  async getSumMessageAdmin(nguoi_nhan: string) {
    const count = await MessagersModel.countDocuments({
      nguoi_nhan: new ObjectId(nguoi_nhan),
      is_read: false,
    });
    return count;
  }

  async getUnreadMessagesGroupedByUser(adminId: string) {
    const result = await MessagersModel.aggregate([
      {
        $match: {
          nguoi_nhan: adminId.toString(),
          is_read: false,
        },
      },
      {
        $group: {
          _id: "$nguoi_gui",
          unreadCount: { $sum: 1 },
        },
      },
      {
        $project: {
          nguoi_gui: "$_id",
          unreadCount: 1,
          _id: 0,
        },
      },
    ]);
    return result;
  }

  async messUser(id_nguoi_gui: string, id_nguoi_nhan: string) {
    return await MessagersModel.find({
      $or: [
        {
          nguoi_gui: new ObjectId(id_nguoi_gui),
          nguoi_nhan: new ObjectId(id_nguoi_nhan),
        },
        {
          nguoi_gui: new ObjectId(id_nguoi_nhan),
          nguoi_nhan: new ObjectId(id_nguoi_gui),
        },
      ],
    }).sort({ createdAt: 1 });
  }

  async getdemtinnhan(nguoi_nhan: string, nguoi_gui: string) {
    const count = await MessagersModel.countDocuments({
      nguoi_gui: new ObjectId(nguoi_gui),
      nguoi_nhan: new ObjectId(nguoi_nhan),
      is_read: false,
    });
    return count;
  }

  // tin nhắn là đã đọc
  async doctinnhanService(nguoi_nhan: string, nguoi_gui: string) {
    const result = await MessagersModel.updateMany(
      {
        nguoi_gui: new ObjectId(nguoi_gui),
        nguoi_nhan: new ObjectId(nguoi_nhan),
        is_read: false, // Chỉ cập nhật tin nhắn chưa đọc
      },
      {
        $set: { is_read: true }, // Cập nhật thành đã đọc
      }
    );

    return result.modifiedCount; // Có thể trả về số lượng tin nhắn đã cập nhật
  }
}
export default MessagersService;
