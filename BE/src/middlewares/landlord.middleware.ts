import { Request, Response, NextFunction } from "express";
import UserModel from "../models/UserModel";

// Middleware kiểm tra user đã đăng nhập có phải chủ trọ được duyệt không
export const isLandlord = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const currentUser = await UserModel.findById(user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (currentUser.vai_tro !== "landlord" || currentUser.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập. Chỉ dành cho chủ trọ đã được duyệt" });
    }

    req.user = currentUser;
    next();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

