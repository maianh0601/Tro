import { Request, Response } from "express";
import PhongTroModel from "../models/PhongTroModel";


// API tìm kiếm phòng trọ
export const searchPhongTro = async (req:Request, res:Response) => {
    try {
        const { ten_phong_tro, min_gia, max_gia, dia_chi, dien_tich, so_luong_nguoi, trang_thai } = req.query;

        let query: any = {}; // Khởi tạo điều kiện tìm kiếm

        // Tìm theo tên phòng (không phân biệt hoa/thường)
        if (ten_phong_tro) {
            query.ten_phong_tro = { $regex: ten_phong_tro, $options: "i" };
        }

        // Tìm theo khoảng giá
        if (min_gia && max_gia) {
            query.gia_tien = { $gte: Number(min_gia), $lte: Number(max_gia) };
        } else if (min_gia) {
            query.gia_tien = { $gte: Number(min_gia) };
        } else if (max_gia) {
            query.gia_tien = { $lte: Number(max_gia) };
        }

        // Tìm theo địa chỉ
        if (dia_chi) {
            query.dia_chi = { $regex: dia_chi, $options: "i" };
        }

        // Tìm theo diện tích (tìm phòng có diện tích đúng hoặc gần đúng)
        if (dien_tich) {
            query.dien_tich = { $regex: dien_tich, $options: "i" };
        }

        // Tìm theo số lượng người
        if (so_luong_nguoi) {
            query.so_luong_nguoi = Number(so_luong_nguoi);
        }

        // Tìm theo trạng thái phòng (1: Còn trống, 0: Đã thuê)
        if (trang_thai) {
            query.trang_thai = Number(trang_thai);
        }

        // Truy vấn MongoDB
        const phongTroList = await PhongTroModel.find(query);

        res.json({ success: true, data: phongTroList });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error });
    }
};
