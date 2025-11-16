import { NextFunction, Request,Response } from "express";
import QuyenChucNangModel from "../models/QuyenChucNangModel";
import AdminModel from "../models/AdminModel";

//dungf cho chức năng phân quyền
export const authorize = (requiredFunction:any) => async (req:Request, res:Response, next:NextFunction) => {
    try {
        const {admin}:any=req 
        const Admin = await AdminModel.findById(admin._id);
        if (!Admin) {
            return res.status(401).json({ message: 'Không tìm thấy Admin' });
        }

        const hasPermission = await QuyenChucNangModel.findOne({
            id_quyen: admin.id_quyen,
            id_chuc_nang: requiredFunction,
        });

        if (!hasPermission) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi kiểm tra quyền', error });
    }
};
