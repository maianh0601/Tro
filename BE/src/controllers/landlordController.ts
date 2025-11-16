import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import PhongTroModel from "../models/PhongTroModel";
import HopDongModel from "../models/HopDongModel";
import yeuthichModel from "../models/YeuThichModel";
import DanhGiaModel from "../models/DanhGiaModel";
import Electricity from "../models/Electricity";

// User đăng ký làm chủ trọ
export const registerLandlord = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ly_do_dang_ky_chu_tro } = req.body;

    if (!ly_do_dang_ky_chu_tro) {
      return res.status(400).json({ message: "Vui lòng nhập lý do đăng ký làm chủ trọ" });
    }

    const existingUser = await UserModel.findById(user._id);
    if (!existingUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (existingUser.trang_thai_chu_tro === "pending") {
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu đăng ký chủ trọ, vui lòng chờ admin duyệt" });
    }

    if (existingUser.vai_tro === "landlord" && existingUser.trang_thai_chu_tro === "approved") {
      return res.status(400).json({ message: "Bạn đã là chủ trọ" });
    }

    existingUser.trang_thai_chu_tro = "pending";
    existingUser.ly_do_dang_ky_chu_tro = ly_do_dang_ky_chu_tro;
    existingUser.ly_do_tu_choi = undefined;
    await existingUser.save();

    return res.status(200).json({ 
      message: "Gửi yêu cầu đăng ký chủ trọ thành công, vui lòng chờ admin duyệt",
      data: existingUser
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin lấy danh sách đăng ký chủ trọ
export const getLandlordRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const filter: any = {};
    if (status) {
      filter.trang_thai_chu_tro = status;
    } else {
      filter.trang_thai_chu_tro = { $in: ["pending", "approved", "rejected"] };
    }

    const requests = await UserModel.find(filter).select("-password");
    
    return res.status(200).json({
      message: "Lấy danh sách yêu cầu thành công",
      data: requests
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin duyệt/từ chối chủ trọ
export const approveLandlord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trang_thai, ly_do_tu_choi } = req.body;

    if (!trang_thai || !["approved", "rejected"].includes(trang_thai)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.trang_thai_chu_tro !== "pending") {
      return res.status(400).json({ message: "Yêu cầu không ở trạng thái chờ duyệt" });
    }

    user.trang_thai_chu_tro = trang_thai;
    
    if (trang_thai === "approved") {
      user.vai_tro = "landlord";
      user.ly_do_tu_choi = undefined;
    } else {
      user.ly_do_tu_choi = ly_do_tu_choi || "Không đủ điều kiện";
    }

    await user.save();

    return res.status(200).json({
      message: trang_thai === "approved" ? "Duyệt chủ trọ thành công" : "Từ chối yêu cầu thành công",
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ lấy danh sách phòng của mình
export const getLandlordRooms = async (req: any, res: Response) => {
  try {
    const { user } = req;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    const rooms = await PhongTroModel.find({ id_chu_tro: user._id });

    return res.status(200).json({
      message: "Lấy danh sách phòng thành công",
      data: rooms
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ xem hợp đồng của người thuê
export const getLandlordContracts = async (req: any, res: Response) => {
  try {
    const { user } = req;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    // Lấy danh sách phòng của chủ trọ
    const rooms = await PhongTroModel.find({ id_chu_tro: user._id });
    const roomCodes = rooms.map(room => room.ma_phong);

    // Lấy hợp đồng của các phòng đó
    const contracts = await HopDongModel.find({ ma_phong: { $in: roomCodes } });

    // Populate thông tin người thuê
    const contractsWithUsers = await Promise.all(
      contracts.map(async (contract) => {
        const tenant = await UserModel.findById(contract.id_users).select("-password");
        const room = rooms.find(r => r.ma_phong === contract.ma_phong);
        return {
          ...contract.toObject(),
          tenant,
          room
        };
      })
    );

    return res.status(200).json({
      message: "Lấy danh sách hợp đồng thành công",
      data: contractsWithUsers
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ xem danh sách người đã liên hệ thuê phòng
export const getLandlordTenants = async (req: any, res: Response) => {
  try {
    const { user } = req;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    // Lấy danh sách phòng của chủ trọ
    const rooms = await PhongTroModel.find({ id_chu_tro: user._id });
    
    // Lấy danh sách người đã thuê (có id_users trong phòng)
    const tenantIds = rooms
      .filter(room => room.id_users)
      .map(room => room.id_users);

    const uniqueTenantIds = [...new Set(tenantIds)];
    
    const tenants = await UserModel.find({ 
      _id: { $in: uniqueTenantIds } 
    }).select("-password");

    // Map tenant với phòng của họ
    const tenantsWithRooms = tenants.map(tenant => {
      const tenantRooms = rooms.filter(room => room.id_users === tenant._id.toString());
      return {
        ...tenant.toObject(),
        rooms: tenantRooms
      };
    });

    return res.status(200).json({
      message: "Lấy danh sách người thuê thành công",
      data: tenantsWithRooms
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// User kiểm tra trạng thái đăng ký chủ trọ
export const checkLandlordStatus = async (req: any, res: Response) => {
  try {
    const { user } = req;

    const currentUser = await UserModel.findById(user._id).select("vai_tro trang_thai_chu_tro ly_do_dang_ky_chu_tro ly_do_tu_choi");

    return res.status(200).json({
      message: "Lấy trạng thái thành công",
      data: currentUser
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ tạo phòng mới
export const createLandlordRoom = async (req: any, res: Response) => {
  try {
    const { user } = req;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    const roomData = {
      ...req.body,
      id_chu_tro: user._id.toString(),
    };

    const newRoom = new PhongTroModel(roomData);
    await newRoom.save();

    return res.status(201).json({
      message: "Tạo phòng thành công",
      data: newRoom
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ cập nhật phòng
export const updateLandlordRoom = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ma_phong } = req.params;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    const room = await PhongTroModel.findOne({ ma_phong });
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    if (room.id_chu_tro !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa phòng này" });
    }

    Object.assign(room, req.body);
    await room.save();

    return res.status(200).json({
      message: "Cập nhật phòng thành công",
      data: room
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Chủ trọ xóa phòng
export const deleteLandlordRoom = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ma_phong } = req.params;

    if (user.vai_tro !== "landlord" || user.trang_thai_chu_tro !== "approved") {
      return res.status(403).json({ message: "Bạn không phải là chủ trọ" });
    }

    const room = await PhongTroModel.findOne({ ma_phong });
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    if (room.id_chu_tro !== user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa phòng này" });
    }

    await PhongTroModel.deleteOne({ ma_phong });

    return res.status(200).json({
      message: "Xóa phòng thành công"
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

