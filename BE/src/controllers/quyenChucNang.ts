import { Request, Response } from "express";
import QuyenChucNangModel from "../models/QuyenChucNangModel";
import ChucNangModel from "../models/ChucNangModel";


export const CreatQuyenChucNang = async (req: Request, res: Response) => {
    try {
        const { id_quyen, functions } = req.body;

        if (!id_quyen || !Array.isArray(functions) || functions.length === 0) {
            return res.status(400).json({ message: "Thiếu thông tin id_quyen hoặc danh sách chức năng" });
        }

        // Xóa tất cả các quyền chức năng hiện có của quyền này
        await QuyenChucNangModel.deleteMany({ id_quyen });

        // Tạo các bản ghi mới
        const newQuyenChucNangList = functions.map((id_chuc_nang) => {
            if (!id_chuc_nang) {
                throw new Error("Thiếu thông tin id_chuc_nang");
            }
            return { id_quyen, id_chuc_nang };
        });

        await QuyenChucNangModel.insertMany(newQuyenChucNangList);

        return res.status(201).json({ message: "Cập nhật quyền chức năng thành công", data: newQuyenChucNangList });
    } catch (error) {
        console.error("Lỗi khi cập nhật quyền chức năng:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const CheckQuyen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Lấy id_quyen từ request

        // Lấy danh sách tất cả chức năng
        const allChucNang = await ChucNangModel.find();

        // Lấy danh sách quyền chức năng theo id_quyen
        const quyenChucNangRepo = await QuyenChucNangModel.find({ id_quyen: id });
        const chucNangIds = quyenChucNangRepo.map((item) => item.id_chuc_nang); // Lấy mảng id chức năng

        // Gán thuộc tính check
        const data = allChucNang.map((cn) => ({
            ...cn.toObject(),
            check: chucNangIds.includes(cn._id.toString()),
        }));

        return res.json({ data });
    } catch (error) {
        console.error("Lỗi khi kiểm tra quyền chức năng:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};
